FROM node:alpine

RUN npm install -g nodemon

WORKDIR /home/chopdulu
COPY package.json ./
RUN npm install
EXPOSE 3000


