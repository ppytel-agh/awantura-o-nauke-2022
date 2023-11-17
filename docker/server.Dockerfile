FROM node:18.18

WORKDIR /home/server

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV SERVER_PORT=8001

RUN npm run build

EXPOSE 8001

CMD ["npm", "start"]