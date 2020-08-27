#!/bin/sh

set -e

PLATFORM="${PLATFORM:-tranque}"

usage() {
    echo "Usage: ./assemble.sh <template> <manifest> <configuration> <encryption-key-file>" 1>&2
    exit 1
}

if [ -z "$1" ] ; then usage ; fi
if [ -z "$2" ] ; then usage ; fi
if [ -z "$3" ] ; then usage ; fi
if [ -z "$4" ] ; then usage ; fi

missing() {
    echo "$1 '$2' not found" 1>&2
    usage
}

if [ ! -d "$1" ] ; then missing template "$1" ; fi
if [ ! -f "$2" ] ; then missing manifest "$2" ; fi
if [ ! -d "$3" ] ; then missing configuration "$3" ; fi
if [ ! -f "$4" ] ; then missing encryption-key-file "$4" ; fi

workdir=$(mktemp -d)
mkdir "${workdir}/${PLATFORM}"

cleanup() {
    rm -rf "${workdir}"
    if [ -n "${ENCRYPTER}" ]
    then
        echo
        echo "Removing temporary containers"
        docker stop ${ENCRYPTER}
    fi
}
trap cleanup EXIT

template="$1"
manifest="$2"
configuration="$3"
encryptionkey="$4"

template_name=$(basename "${template}")
manifest_name=$(basename "${manifest}")
configuration_name=$(basename "${configuration}")
package="${PLATFORM}.${template_name}.${manifest_name}.${configuration_name}.tgz"

# Copy the template
cp -r "${template}" "${workdir}/${PLATFORM}/base"

# Use the manifest as source for replacements
find "${workdir}/${PLATFORM}/base" -type f \
    | while read -r templatefile ; do sed -i -f "${manifest}" "${templatefile}" ; done

# Copy the configuration
cp -r "${configuration}" "${workdir}/${PLATFORM}/config"

# Copy the manifest and some information about the current build
mkdir "${workdir}/${PLATFORM}/manifest"
cp "${manifest}" "${workdir}/${PLATFORM}/manifest/${manifest_name}"
cat > "${workdir}/${PLATFORM}/manifest/${manifest_name}.build" <<EOF
CI_COMMIT_SHA=${CI_COMMIT_SHA:-local}
CI_JOB_ID=${CI_JOB_ID:-local}
EOF

if [ "${SERIALIZE_IMAGES}" = "yes" ]
then
    # Collect images referenced by the compose files
    cat "${workdir}/${PLATFORM}/base/docker-compose.yml" \
        "${workdir}/${PLATFORM}/config/docker-compose.yml" 2> /dev/null \
        | grep "image: " \
        | while read -r img ; do echo -n $img | cut -d " " -f 2 ; done \
        | sort \
        | uniq \
        | while read -r img ; do docker pull "$img" 1>&2 ; echo "$img" ; done \
        | xargs docker save \
        | gzip > "${workdir}/${PLATFORM}/images.tgz"
fi

# Archive and encrypt the configuration portion of the package
ENCRYPTER=$(docker run --rm -d -w /workdir alpine:3.10 sleep 1h)
docker cp "${encryptionkey}" "${ENCRYPTER}:/keyfile"
docker cp "${workdir}/${PLATFORM}/config" "${ENCRYPTER}:/workdir/config"
docker exec -i "${ENCRYPTER}" sh /dev/stdin <<EOSCRIPT
apk add --update --no-cache openssl
cd /workdir
tar cz config \
    | openssl enc \
              -e \
              -aes-256-cbc \
              -pbkdf2 \
              -salt \
              -out /workdir/config.tgz.enc \
              -pass file:/keyfile
EOSCRIPT
docker cp "${ENCRYPTER}:/workdir/config.tgz.enc" "${workdir}/${PLATFORM}/config.tgz.enc"
rm -r "${workdir}/${PLATFORM}/config"

# Create the installation script
cat > "${workdir}/${PLATFORM}/install.sh" <<"EOF"
#!/bin/sh

set -e

docker --version
docker-compose --version

cleanup() {
    if [ -n "${DECRYPTER}" ]
    then
        echo
        echo "Removing temporary containers"
        docker stop ${DECRYPTER}
    fi
}
trap cleanup EXIT

if [ -d config ]
then
    echo
    echo "Configuration is already decrypted"
    unpacked="1"
else
    if [ ! -f "$1" ]
    then
        echo "Missing decryption key" 1>&2
        echo "Usage: ./install.sh [decryption-key-file]" 1>&2
        exit 1
    else
        DECRYPTER=$(docker run --rm -d -w /workdir alpine:3.10 sleep 1h)
        docker cp $1 ${DECRYPTER}:/workdir/keyfile
        docker cp config.tgz.enc ${DECRYPTER}:/workdir/config.tgz.enc
        docker exec -i ${DECRYPTER} sh /dev/stdin <<EOSCRIPT
apk add --update --no-cache openssl
cd /workdir
openssl enc \
        -d \
        -aes-256-cbc \
        -pbkdf2 \
        -in /workdir/config.tgz.enc \
        -pass file:/workdir/keyfile \
      | tar xz
EOSCRIPT
        docker cp ${DECRYPTER}:/workdir/config config
    fi
fi

if [ -f images.tgz ] ; then docker load < images.tgz ; fi

if [ -x config/install.sh ]
then
    if [ -z "${unpacked}" ] ; then shift ; fi
    config/install.sh "$@"
fi

docker-compose -f base/docker-compose.yml $(
    if [ -f config/docker-compose.yml ] ; then echo -n "-f config/docker-compose.yml" ; fi
) config > docker-compose.yml

if [ "$(sysctl -n vm.max_map_count)" -lt "262144" ]
then
    echo
    echo "WARNING:"
    echo "The kernel variable vm.max_map_count needs to be at least 262144"
    echo "Currently, it's set to $(sysctl -n vm.max_map_count)"
    echo "You may set this with:"
    echo "    sudo sysctl -w vm.max_map_count=262144"
    echo "You should set this permanently by changing the corresponding line in /etc/sysctl.conf"
fi

echo
echo "Installation complete. Deploy the stack with:"
echo "docker-compose up -d"
EOF
chmod a+x "${workdir}/${PLATFORM}/install.sh"

# Create the tgz package
tar cz -C "${workdir}" -f "${workdir}/${package}" "${PLATFORM}"
cp "${workdir}/${package}" "./${package}"
echo "Created package file ${package}"
