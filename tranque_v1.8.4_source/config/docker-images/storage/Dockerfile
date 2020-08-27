FROM minio/minio:RELEASE.2020-03-14T02-21-58Z

COPY entrypoint.sh /entrypoint.sh

ENV S3_BUCKET_NAME ""
ENV BACKUP_BUCKET_NAME ""

ENTRYPOINT ["/entrypoint.sh"]
CMD ["minio", "server", "/data"]
