FROM openjdk:7-jdk-jessie

COPY aux/lein /usr/bin/lein
RUN chmod +x /usr/bin/lein

WORKDIR /app

COPY project.clj /app/
RUN lein deps

COPY . /app

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["lein", "run"]
