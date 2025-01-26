FROM node:lts AS build
WORKDIR /usr/app
COPY ./package*.json ./
RUN npm ci
RUN npm install -g @nestjs/cli
COPY . .
RUN npm run build

FROM node:lts-alpine AS publish
RUN apk add --no-cache bash
WORKDIR /usr/app
RUN npm install -g pm2
COPY ./package*.json ./
RUN npm ci --production
# COPY ./config ./config
COPY ./env /env
COPY ./*.sh ./
RUN chmod +x docker-entrypoint.sh
COPY ./nest-cli.json ./nest-cli.json
COPY --from=build /usr/app/dist ./dist
EXPOSE 3000
USER node
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD [ "pm2-runtime", "npm", "--", "run", "start:prod" ]
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget http://localhost:3000/health -q -O - > /dev/null 2>&1
