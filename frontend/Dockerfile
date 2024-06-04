FROM node:15

WORKDIR /frontend

COPY package*.json /frontend/
RUN npm install 
COPY . /frontend/

EXPOSE 3000