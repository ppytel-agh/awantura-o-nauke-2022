FROM node:18.18

WORKDIR /home/server

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=development
ENV SERVER_PORT=8010

EXPOSE 8010

CMD ["npm", "run", "server"]