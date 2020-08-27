FROM docker.elastic.co/logstash/logstash-oss:7.3.1

ENV REDIS_HOST redis
ENV REDIS_KEY beats.buffer
ENV ELASTICSEARCH_PROTOCOL http
ENV ELASTICSEARCH_HOST elasticsearch
ENV ELASTICSEARCH_PORT 9200
ENV AMQP_HOST amqpbroker
ENV AMQP_PORT 5672
ENV AMQP_USERNAME guest
ENV AMQP_PASSWORD guest
ENV AMQP_VHOST /
ENV AMQP_EXCHANGE enrichment
ENV AMQP_TOPIC data.timeframe

# install aggregate plugin
RUN bin/logstash-plugin install logstash-filter-aggregate

# copy custom logstash configuration
COPY --chown=1000 logstash.yml /usr/share/logstash/config
COPY --chown=1000 logstash.conf /usr/share/logstash/pipeline
RUN mkdir -p /usr/share/logstash/es-templates
COPY --chown=1000 timeseries-template.json /usr/share/logstash/es-templates/timeseries.json

# install netcat
USER root
RUN yum install nc -y && \
  yum clean all
USER logstash

# healthcheck
HEALTHCHECK --interval=1s --timeout=5s --retries=120 \
  CMD nc -z localhost 9600 || exit 1
