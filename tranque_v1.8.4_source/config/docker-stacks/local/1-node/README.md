# How to run a local Tranque server stack?

Requirements:

  - [docker](https://docs.docker.com/install/)
  - [docker-compose](https://docs.docker.com/compose/install/)
  - [git-crypt](https://github.com/AGWA/git-crypt/blob/master/INSTALL.md)

1. Clone this repo:

  `$ git clone https://gitlab.com/Inria-Chile/tranque/config.git`

1. Go to your cloned repo:

  `$ cd config`

1. Unlock encrypted files <sup>[1](#git-crypt-note)</sup>:

  `$ git-crypt unlock`

1. Update docker images given by the local docker-compose file:

  `$ docker-compose -f docker-stacks/local/1-node/docker-compose.yml pull`

1. Build docker images hosted versioned on this repo:

  `$ docker-compose -f docker-stacks/local/1-node/docker-compose.yml build`

1. Start local stack:

  `$ docker-compose -f docker-stacks/local/1-node/docker-compose.yml up -d`

1. Check logs of any container (e.g. nginx):

  `$ docker-compose -f docker-stacks/local/1-node/docker-compose.yml logs -f nginx`

1. Stop local stack:

  `$ docker-compose -f docker-stacks/local/1-node/docker-compose.yml down`

<a name="git-crypt-note">[1]</a>: git-crypt access is limited to restricted users only. There are two ways to unlock an encrypted repo:
  - (recommended for developers) **add your user gpg key** to the repo, Ask an administrator how to add yourself as a developer using your computer's gpg key.
  - (recommended for servers) **use a symmetric key** to decrypt secrets, like the one stored at `secret/tranque/dev/git-crypt/config` on our Vault.
