FROM r-base:3.6.1

RUN apt-get update && \
  apt-get install -y libcurl4-openssl-dev libxml2-dev curl netcat && \
  wget https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 && \
  mv jq-linux64 /usr/bin/jq && \
  chmod a+x /usr/bin/jq

COPY install-packages.R install-packages.R
RUN Rscript install-packages.R

WORKDIR /app
COPY src-r /app

COPY test-r /test
RUN /test/run.sh

EXPOSE 5000

CMD ["Rscript", "--vanilla", "/app/index.R"]
