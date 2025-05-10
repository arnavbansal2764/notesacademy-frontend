FROM node:21-alpine

EXPOSE 3000

WORKDIR /app

COPY . .

RUN npm install -g npm@10.7.0

RUN npm install

RUN npm run build

RUN rm -r src

CMD [ "npm", "run", "start"]