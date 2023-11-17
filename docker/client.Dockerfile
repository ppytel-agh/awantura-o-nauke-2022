FROM node:16.8 as build-stage

WORKDIR /home/client

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

#stage 2 - deployment
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build-stage /home/client/dist /usr/share/nginx/html

# Expose port 80 (default for Nginx)
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]