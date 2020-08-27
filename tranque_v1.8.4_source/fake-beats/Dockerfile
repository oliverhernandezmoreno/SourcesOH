FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --non-interactive

COPY . .
RUN yarn build

EXPOSE 5000

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["yarn", "start", "beater"]
