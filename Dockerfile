FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env .env

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]