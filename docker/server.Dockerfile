FROM node:18.12

EXPOSE 8000

COPY ../server/package.json /home/server

WORKDIR /home/server

RUN npm install

ENTRYPOINT ["bash", "-c"]