ARG NODE_VERSION=latest
FROM node:$NODE_VERSION

ARG HTTP_SERVER_PORT=80
EXPOSE $HTTP_SERVER_PORT

COPY package.json /home/node

WORKDIR /home/node

RUN npm install

ENTRYPOINT ["bash", "-c"]