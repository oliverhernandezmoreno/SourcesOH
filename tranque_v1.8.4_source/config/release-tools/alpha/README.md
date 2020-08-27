```bash
cd config/release-tools/alpha
```

# 0) Tag of components:

The following script creates the tag of a component:

```bash
./create-tag-frontend.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
./create-tag-backend.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
./create-tag-enrichment.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
./create-tag-stream-snapshot.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
./create-tag-beats-consumer.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
./create-tag-stats.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
./create-archivist.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
./create-config.sh v1.8.0 v1.0.0 dev 2020-07-23_21-16-36
```

# 1) Tag of a new release:

The following script creates the tag of a new the release:

```bash
./tags.sh v1.8.0 v1.0.0 v1.0.1 v1.0.2 v1.2.0 v1.1.0 v1.2.1 v1.0.2 v1.2.0 dev 2020-07-23_21-16-36
```

# 2) Deploy the new release:

The following script deploys the new release to the alfa server SML:

```bash
./sml/deploy.sh v1.8.0 v1.0.0 v1.0.1 v1.0.2 v1.2.0 v1.1.0 v1.2.1 v1.0.2 v1.2.0 2020-07-23_21-16-36
```

The following script deploys the new release to the alfa server SMC:

```bash
./smc/deploy.sh v1.8.0 v1.0.0 v1.0.1 v1.0.2 v1.2.0 v1.1.0 v1.2.1 v1.0.2 v1.2.0 2020-07-23_21-16-36
```

# 3) Re-start the servers:

The following script restart the Docker of alfa server SML:

```bash
./sml/restart.sh v1.8.0 2020-07-23_21-16-36
```

The following script restart the Docker of alfa server SMC:

```bash
./smc/restart.sh v1.8.0 2020-07-23_21-16-36
```

# 4) Make a new release:

The following script performs al the release:

```bash
./release.sh
```
