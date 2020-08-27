# Generic QA environment

This configuration may be used to prepare a generic fake installation
for use during end-to-end testing.

## How to use

0. Define a proper `NAMESPACE` for this stack, editing
   `.env.secrets`'s first line with the corresponding value for the
   variable.

1. Load the snapshot for the corresponding QA environment:
   ```bash
   docker-compose run --rm archivist restore latest
   ```

2. If the stack corresponds to an SMC-connected SML, modify the
   environment variables within `.env.secrets` with the following
   (uncommenting and putting correct values in each):
   ```
   SMC_AMQP_HOST=<SMC AMQP host here>
   SMC_S3_BUCKET_NAME=<SMC storage bucket name here>
   SMC_S3_ENDPOINT_URL=<SMC storage endpoint URL here>
   ```

3. If the stack corresponds to an SMC, **remove** the following
   entries from `.env.secrets`:
   - `SMC_AMQP_HOST`
   - `SMC_AMQP_PORT`
   - `SMC_AMQP_USERNAME`
   - `SMC_AMQP_PASSWORD`
   - `SMC_S3_ACCESS_KEY_ID`
   - `SMC_S3_SECRET_ACCESS_KEY`
   - `SMC_S3_BUCKET_NAME`
   - `SMC_S3_ENDPOINT_URL`

4. If the stack corresponds to an SMC, create a bucket for the SML
   with:
   ```bash
   docker-compose run --rm --entrypoint '' storage mkdir -p /data/sml-bucket
   ```

5. Re-install and launch the full stack:
   ```bash
   ./install.sh
   docker-compose up -d
   ```
