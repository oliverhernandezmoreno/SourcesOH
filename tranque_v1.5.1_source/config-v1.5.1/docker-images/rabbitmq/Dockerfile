FROM debian:buster

RUN apt-get update && apt-get install -y curl unzip
WORKDIR /tmp
RUN curl https://dl.bintray.com/rabbitmq/community-plugins/3.7.x/rabbitmq_message_timestamp/rabbitmq_message_timestamp-20170830-3.7.x.zip > rabbitmq_message_timestamp-20170830-3.7.x.zip && \
    unzip rabbitmq_message_timestamp-20170830-3.7.x.zip

FROM rabbitmq:3.7.8-management-alpine
COPY --from=0 /tmp/rabbitmq_message_timestamp-20170830-3.7.x.ez plugins/
RUN rabbitmq-plugins enable rabbitmq_message_timestamp
