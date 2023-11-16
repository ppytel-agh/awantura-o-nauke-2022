FROM node:18.18

WORKDIR /home/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "server"]