FROM docker.elastic.co/elasticsearch/elasticsearch-oss:7.3.1

# copy custom elasticsearch configuration
COPY elasticsearch.yml /usr/share/elasticsearch/config

# healthcheck
HEALTHCHECK --interval=1s --timeout=5s --retries=120 \
  CMD nc -z localhost 9200 || exit 1
