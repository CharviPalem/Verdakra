FROM node:20-alpine

WORKDIR /app

RUN apk update && \
    apk add --no-cache g++ && \
    apk add --no-cache openjdk11-jdk && \
    apk add --no-cache build-base && \
    apk add --no-cache python3 && \
    ln -sf python3 /usr/bin/python && \
    ln -sf pip3 /usr/bin/pip && \
    apk add --no-cache libc6-compat

# Although we run code inside this container, the orchestrator (our node app) might need docker cli.
# This is not strictly necessary for the current setup but can be useful.
RUN apk add --no-cache docker-cli

COPY package*.json ./

RUN npm install

COPY . .

# This Dockerfile is for building an execution environment.
# The CMD is not strictly necessary as we will be providing the command via `docker run`.
# However, having a default command is good practice.
CMD [ "node", "app.js" ]
