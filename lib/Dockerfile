FROM node:18-alpine as backend-build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG DB_HOST
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
ARG OPENAI_API_KEY

ENV DB_HOST=$DB_HOST
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_NAME=$DB_NAME
ENV OPENAI_API_KEY=$OPENAI_API_KEY

EXPOSE 9000
CMD ["node", "index.js"]
