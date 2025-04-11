FROM node:20.11.1-alpine3.19

WORKDIR /app

COPY package*.json ./
COPY .nvmrc ./

RUN npm install -g npm@10.2.4
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 