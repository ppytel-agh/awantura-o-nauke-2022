FROM node:18.18

WORKDIR /home/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8010

CMD ["npm", "run", "server"]