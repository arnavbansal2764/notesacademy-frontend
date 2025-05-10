FROM node:21-alpine

EXPOSE 3000

WORKDIR /app

COPY . .

RUN npm install -g npm@10.7.0

RUN npm install

RUN npm run build

RUN rm -r src .eslintrc.json .gitignore Dockerfile tsconfig.json postcss.config.mjs README.md tailwind.config.ts types prisma

CMD [ "npm", "run", "start"]