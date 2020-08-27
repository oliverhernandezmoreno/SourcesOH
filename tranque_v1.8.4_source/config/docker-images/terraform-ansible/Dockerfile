FROM docker:19.03.0

# install dependencies
RUN apk add --update --no-cache \
  openssl \
  python \
  py-yaml \
  py-paramiko \
  py-jinja2 \
  py-httplib2 \
  git \
  alpine-sdk \
  py-pip \
  rsync \
  openssh-client && \
  rm -rf /var/cache/apk/*

RUN pip install packaging

# install ansible (version 2.8 devel)
RUN git clone https://github.com/ansible/ansible.git --recursive && \
  cd ansible && \
  git reset --hard fdc3f16bba4b6ec7fa29144f51fdf70a616bdd4d && \
  make && \
  make install

# install terraform
RUN wget -q -O terraform.zip https://releases.hashicorp.com/terraform/0.11.14/terraform_0.11.14_linux_amd64.zip && \
  unzip terraform.zip && \
  rm -rf terraform.zip && \
  mv terraform /usr/bin/terraform

# install terraform-inventory
RUN wget -q -O terraform-inventory.zip https://github.com/nicosingh/terraform-inventory/releases/download/v0.81/terraform-inventory_v0.81_linux_amd64.zip && \
  unzip terraform-inventory.zip && \
  rm -rf terraform-inventory.zip && \
  mv terraform-inventory /usr/bin/terraform-inventory

# install aws cli
RUN pip install awscli

# install vault
RUN wget -q -O vault.zip https://releases.hashicorp.com/vault/0.11.1/vault_0.11.1_linux_amd64.zip && \
  unzip vault.zip && \
  rm -rf vault.zip && \
  mv vault /usr/bin/vault

# install git crypt
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://raw.githubusercontent.com/sgerrand/alpine-pkg-git-crypt/master/sgerrand.rsa.pub && \
  wget -q https://github.com/sgerrand/alpine-pkg-git-crypt/releases/download/0.6.0-r1/git-crypt-0.6.0-r1.apk && \
  apk add git-crypt-0.6.0-r1.apk && \
  rm -rf git-crypt-0.6.0-r1.apk

# install jq
RUN wget https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 && \
  mv jq-linux64 /usr/bin/jq && \
  chmod a+x /usr/bin/jq
