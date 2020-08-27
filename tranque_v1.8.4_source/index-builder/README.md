# tranque-index-builder

This is a common set of tools used to build any index into a
deployment-ready docker image.

## Usage

There's two use cases:
- to test the building of an index
- to assist in building the index and pushing it to the registry during CI

Both cases assume the index files are contained within a single folder
named `src`. To "build" the index into a gzipped tar file, the
following commands should suffice (from the parent directory of `src`):

```bash
docker pull registry.gitlab.com/inria-chile/tranque/index-builder
tar czf - src | docker run --rm -i registry.gitlab.com/inria-chile/tranque/index-builder > build.tgz
```

A `build.tgz` file will be created with the assembled index artifacts.

To use the builder during CI, a specialized image was prepared. A
build step for an index repository would be:

```yaml
build-index:
  stage: build
  image: registry.gitlab.com/inria-chile/tranque/index-builder/ci-helper:latest
  services:
    - docker: dind
  script:
    - build-and-push
```

The assembled image will be a `busybox` image with the `/build.tgz`
file, and a default command that exposes said file in a netcat
webserver.
