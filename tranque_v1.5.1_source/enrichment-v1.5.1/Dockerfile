FROM node:lts-alpine

RUN apk add --update --no-cache netcat-openbsd

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --non-interactive

COPY . .
RUN yarn build-indices

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["yarn", "start", "worker"]
