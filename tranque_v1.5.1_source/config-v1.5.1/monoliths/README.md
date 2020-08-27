# tranque monoliths

These are tools used to generate monolithic self-contained packages,
which are themselves sufficient to deploy a working installation of
the stack based on docker-compose.

The tools available are:
- **templates**, which describe the general structure of a stack in
  terms of docker-compose and some service-specific configuration
  files.
- **manifests**, which specify the exact image tag of all the services
  in a template.
- **configurations**, which are instalation-specific configurations,
  as well as extensions of the template such as data producers.
- The `assemble.sh` script, which produces a single package given a
  template, a manifest and a configuration.

## How to use

### How to assemble a package

Pick a combination of a template, manifest and configuration. Select
or fabricate an appropriate base64-encoded 256-bit encryption key
file. Then:

```bash
./assemble.sh templates/<chosen-template> \
              manifests/<chosen-manifest> \
              configurations/<chosen-configuration> \
              <encryption-key-file>
# the result will be a large tgz file in the current directory
# the file will be named with the names of the chosen artifacts:
# tranque.<chosen-template>.<chosen-manifest>.<chosen-configuration>.tgz
```

For example:

```bash
./assemble.sh templates/full manifests/v1-3-2 configurations/mlp-dev
# resulting file is tranque.full.v1-3-2.mlp-dev.tgz
```

### How to install a package

Starting from a valid package file and an decryption key file:

```bash
tar xzf tranque.<template>.<manifest>.<configuration>.tgz
# the extracted folder will be called 'tranque'
cd tranque
./install.sh <decryption-key-file>
```

After installation, the stack is controlled through docker-compose
from within the `tranque` folder, as usual:

```bash
# start the stack
docker-compose up -d
# stop the stack
docker-compose down
```

Also, subsequent installations won't need the decryption key file:

```bash
./install.sh
# Will 'reinstall' starting from the decrypted configuration
```

### How to update an already installed package

Given a currently installed-and-running monolith, and another new
package which contains compatible upgrades to said monolith, the
procedure for updating the installation is:

```bash
# rename the previous 'tranque' folder
mv tranque tranque-old
# install the new package
tar xzf tranque.<new-template>.<new-manifest>.<new-configuration>.tgz
cd tranque
./install.sh <decryption-key-file>
# perform a rolling-update
docker-compose up -d
```

### How to install a package and provide SSL certificates

Before installation, copy both the certificate and it's private key in
PEM format into the `base/proxy` folder. Rename them `fullchain.pem`
and `privkey.pem` respectively. Installation will then take them into
account.

## Anatomy of a monolith

The assemble script creates monoliths with the following structure:
- `base` is the resulting folder of interpolating the _template_
  through the _manifest_.
- `manifest` is a folder with a copy of the manifest and a build file,
  only for auditing purposes.
- `config.tgz.enc` is the configuration folder, encrypted.
- `config` is the result of decrypting `config.tgz.enc`
  (i.e. installing and giving a valid decryption key) and contains an
  exact copy of the selected configuration.

The `install.sh` script will perform these tasks in order:
1. Decrypt and unwrap `config.tgz.enc`.
2. Invoke an executable `config/install.sh` file, if it exists (and is
   in fact executable).
3. Load all docker images from the images bundle.
4. Build a stack-global docker-compose file from
   `base/docker-compose.yml` and optionally
   `config/docker-compose.yml`, if the latter exists.

All of these points have some implications for monolith developers:
- The config docker-compose file should reference local files and
  folders starting from `../` (the "tranque" folder), since the base
  docker-compose file is the one found in `base`, and that's the root
  directory that the stack-global compose file will assume.
- Interdependencies between the template and the configuration should
  be minimized, instead being relegated to internal service
  communications. _However_, it is expected for the template to at
  least reference a single `.env.secrets` file in the configuration,
  as in:

```yaml
# base/docker-compose.yml

services:
  some-service:
    image: some-image
    env_file:
      - .env.defaults
      - ../config/.env.secrets
```

- The backend's setup package is another example of a necessary
  dependency of a template onto a configuration.
