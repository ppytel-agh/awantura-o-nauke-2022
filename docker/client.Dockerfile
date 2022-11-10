FROM node:16.18

EXPOSE 8080

COPY ../client/package.json /home/client

WORKDIR /home/client

RUN npm install

ENTRYPOINT ["bash", "-c"]