# Dockerfile simplificado para Web-Client (Frontend)
FROM nginx:alpine

# Copiar el build hecho desde el host
WORKDIR /usr/share/nginx/html
COPY ./apps/web-client/dist ./

# Configuración de Nginx
COPY ./deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
