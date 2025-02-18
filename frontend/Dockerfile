FROM node:18-alpine as frontend-build

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install express mysql2 bcrypt jsonwebtoken cookie-parser dotenv cors
COPY . .

ARG MY_HOST
ARG VITE_GOOGLE_MAPS_API_KEY

ENV MY_HOST=$MY_HOST
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build

FROM node:18-alpine as frontend-serve

WORKDIR /app
COPY --from=frontend-build /app/dist /app/dist

RUN npm install -g serve

ARG MY_HOST
ARG VITE_GOOGLE_MAPS_API_KEY

ENV MY_HOST=$MY_HOST
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]