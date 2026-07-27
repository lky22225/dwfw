#!/bin/bash

# AWS 배포 스크립트
# 사용법: ./deploy-aws.sh [backend|frontend|all]

set -e

BACKEND_HOST="ec2-user@your-ec2-ip"
BACKEND_KEY="~/.ssh/dwfw-key.pem"
S3_BUCKET="dwfw-frontend-<your-unique-id>"
CLOUDFRONT_DIST_ID="YOUR_DISTRIBUTION_ID"

deploy_backend() {
    echo "=== 백엔드 배포 시작 ==="
    
    cd backend
    
    echo "Maven 빌드 중..."
    mvn clean package -DskipTests
    
    echo "EC2에 JAR 파일 업로드 중..."
    scp -i $BACKEND_KEY target/dwfw-backend-1.0.0.jar $BACKEND_HOST:/home/ec2-user/
    
    echo "백엔드 서비스 재시작 중..."
    ssh -i $BACKEND_KEY $BACKEND_HOST "sudo systemctl restart dwfw-backend"
    
    echo "백엔드 배포 완료!"
    cd ..
}

deploy_frontend() {
    echo "=== 프론트엔드 배포 시작 ==="
    
    cd frontend
    
    echo "의존성 설치 중..."
    npm install
    
    echo "프로덕션 빌드 중..."
    REACT_APP_API_URL=https://your-backend-domain.com/api npm run build
    
    echo "S3에 업로드 중..."
    aws s3 sync build/ s3://$S3_BUCKET --delete
    
    echo "CloudFront 캐시 무효화 중..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DIST_ID \
        --paths "/*"
    
    echo "프론트엔드 배포 완료!"
    cd ..
}

case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "사용법: $0 [backend|frontend|all]"
        exit 1
        ;;
esac

