# Сборка SPA (ssr: false): на выходе только статические файлы в build/client
FROM node:20-alpine AS build-env
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci
COPY . /app/
RUN npm run build

# Раздача статики через nginx. Любой неизвестный путь (например, /lesson/3)
# отдаёт index.html, дальше маршрут обрабатывает React Router в браузере.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-env /app/build/client /usr/share/nginx/html
EXPOSE 80
