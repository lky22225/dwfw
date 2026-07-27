# Google Cloud Run용 Dockerfile
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Maven 빌드된 JAR 파일 복사
COPY target/dwfw-backend-1.0.0.jar app.jar

# 데이터 디렉토리 생성 (Cloud Run은 임시 파일 시스템 사용)
RUN mkdir -p /tmp/data

# 포트 노출
EXPOSE 8080

# Cloud Run은 PORT 환경 변수를 사용하므로, 애플리케이션이 이를 인식하도록 설정
ENV PORT=8080
ENV SPRING_JSON_DATA_PATH=/tmp/data
ENV SPRING_PROFILES_ACTIVE=cloudrun

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]

