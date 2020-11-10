# Docker file for deployment on Google App Engine
FROM gcr.io/google-appengine/nodejs

# Set the environment to development so devDependencies can be installed
ENV NODE_ENV development

# File Author / Maintainer
# Provides cached layer for node_modules
ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

# Define working directory
ADD . /app
WORKDIR /app

# Build all needed things for the server
RUN npm run build

# Set the environment to production
ENV NODE_ENV production

# DB migrations
# RUN npm run dist:db:migrate

#RUN cat ./server/dist/index.js
CMD ["npm", "start"]
