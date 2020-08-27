# Release Script

This script will create the proper bash script to upload the images from Inria's docker registry to FCH's.

It handles the proper path and image naming according to the expected paths used by the config repo's artefacts (azure stacks, monoliths).

To execute the script, helper Dockerfile and docker-compose.yml files are provided:

```bash
$ docker-compose run release > release_plan.sh

$ bash release_plan.sh
```
