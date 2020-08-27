FROM node:11.7.0-alpine

WORKDIR /usr/src/app

COPY . .
RUN yarn

EXPOSE 8000

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["yarn", "start"]
