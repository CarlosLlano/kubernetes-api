FROM node:latest
WORKDIR /app
ADD package.json /app
RUN npm install
ADD index.js /app
ADD scripts /app/scripts
CMD node index.js
EXPOSE 8081
