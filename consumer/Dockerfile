# consumer/Dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# run your consumer entry (index.mjs)
CMD ["npm", "run", "dev"]