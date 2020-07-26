FROM node:8.16.1-alpine
ARG MODE
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY package.json .
COPY index.js .
RUN npm install --quiet
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
CMD /wait && npm start