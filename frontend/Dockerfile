# 프론트엔드용 Nginx Dockerfile
FROM nginx:alpine

# 빌드된 파일 복사
COPY build/ /usr/share/nginx/html/

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

