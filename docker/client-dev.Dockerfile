FROM node:16.8

WORKDIR /home/client

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=development

EXPOSE 8080

CMD ["npm", "run", "serve"]