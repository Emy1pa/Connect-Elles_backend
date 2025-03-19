FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npm run build

EXPOSE 4000

CMD [ "npm" , "run", "start"]