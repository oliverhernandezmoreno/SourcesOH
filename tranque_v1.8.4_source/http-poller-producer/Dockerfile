FROM python:3.6-alpine

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

ARG CI_COMMIT_SHA=local
ENV COMMIT ${CI_COMMIT_SHA}

CMD ["src/manage.py", "startpoller"]
