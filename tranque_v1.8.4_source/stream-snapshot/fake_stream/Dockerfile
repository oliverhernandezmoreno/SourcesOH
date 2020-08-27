FROM python:3.6-buster

ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

# Add Tini
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

RUN apt-get update && apt-get install -y vlc

RUN mkdir /videos

RUN useradd -m vlcuser
USER vlcuser

COPY requirements.txt /usr/src/app/requirements.txt

RUN pip install -r requirements.txt

COPY ./src /usr/src/app
CMD ["sh", "cmd.sh"]
