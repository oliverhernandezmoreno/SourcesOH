FROM python:3.8-alpine3.12

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY release.py .

CMD [ "python", "./release.py" ]
