FROM node:20-alpine

WORKDIR /app
COPY . .
RUN ls
RUN npm install
RUN npm run build
CMD [ "npm", "run", "start" ]
