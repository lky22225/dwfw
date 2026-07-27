# Google Cloud Platform 배포 스크립트
# 사용법: .\deploy-gcp.ps1 [backend|frontend|all]

param(
    [Parameter(Position=0)]
    [ValidateSet("backend", "frontend", "all")]
    [string]$Target = "all"
)

# 설정 변수 (수정 필요)
$PROJECT_ID = "friendly-aura-477305-g3"
$BACKEND_IMAGE = "gcr.io/$PROJECT_ID/dwfw-backend:latest"
$FRONTEND_BUCKET = "dwfw-frontend-bucket0001"
$REGION = "asia-northeast3"
$CLOUDRUN_SERVICE = "dwfw-backend"
$CLOUDRUN_URL = "https://$CLOUDRUN_SERVICE-<hash>.$REGION.run.app"

function Deploy-Backend {
    Write-Host "=== 백엔드 배포 시작 ===" -ForegroundColor Green
    
    # Java와 Maven 경로 설정
    $JAVA_HOME = "D:\DwFw\jdk-17.0.2"
    $MAVEN_HOME = "D:\DwFw\apache-maven-3.9.6"
    $env:JAVA_HOME = $JAVA_HOME
    $env:PATH = "$JAVA_HOME\bin;$MAVEN_HOME\bin;$env:PATH"
    
    Push-Location backend
    
    try {
        # Maven 빌드
        Write-Host "Maven 빌드 중..." -ForegroundColor Yellow
        & "$MAVEN_HOME\bin\mvn.cmd" clean package -DskipTests
        
        if ($LASTEXITCODE -ne 0) {
            throw "Maven 빌드 실패"
        }
        
        # Cloud Build를 사용하여 Docker 이미지 빌드 및 배포
        Write-Host "Cloud Build로 이미지 빌드 및 업로드 중..." -ForegroundColor Yellow
        
        # cloudbuild.yaml 파일 생성
        $cloudbuildYaml = @"
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '$BACKEND_IMAGE', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '$BACKEND_IMAGE']
images:
  - '$BACKEND_IMAGE'
"@
        $cloudbuildYaml | Out-File -FilePath "cloudbuild.yaml" -Encoding utf8
        
        # Cloud Build 실행
        gcloud builds submit --tag $BACKEND_IMAGE --project $PROJECT_ID
        
        if ($LASTEXITCODE -ne 0) {
            throw "Cloud Build 실패"
        }
        
        # 임시 파일 삭제
        Remove-Item -Path "cloudbuild.yaml" -ErrorAction SilentlyContinue
        
        # Cloud Run에 배포
        Write-Host "Cloud Run에 배포 중..." -ForegroundColor Yellow
        gcloud run deploy $CLOUDRUN_SERVICE `
            --image $BACKEND_IMAGE `
            --platform managed `
            --region $REGION `
            --allow-unauthenticated `
            --port 8080 `
            --set-env-vars "SPRING_JSON_DATA_PATH=/tmp/data"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Cloud Run 배포 실패"
        }
        
        Write-Host "백엔드 배포 완료!" -ForegroundColor Green
    } catch {
        Write-Host "배포 실패: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
}

function Deploy-Frontend {
    Write-Host "=== 프론트엔드 배포 시작 ===" -ForegroundColor Green
    
    Push-Location frontend
    
    try {
        # Cloud Run 서비스 URL 가져오기
        Write-Host "Cloud Run 서비스 URL 확인 중..." -ForegroundColor Yellow
        $cloudRunUrl = gcloud run services describe $CLOUDRUN_SERVICE --region $REGION --format "value(status.url)" --project $PROJECT_ID 2>$null
        if (-not $cloudRunUrl) {
            Write-Host "백엔드가 아직 배포되지 않았습니다. 백엔드 URL을 수동으로 입력하세요." -ForegroundColor Yellow
            $cloudRunUrl = Read-Host "백엔드 URL 입력 (예: https://dwfw-backend-xxx.run.app)"
        } else {
            Write-Host "백엔드 URL: $cloudRunUrl" -ForegroundColor Green
        }
        
        # 의존성 설치
        Write-Host "의존성 설치 중..." -ForegroundColor Yellow
        npm install
        
        # 환경 변수 설정 및 빌드
        Write-Host "프로덕션 빌드 중..." -ForegroundColor Yellow
        $env:REACT_APP_API_URL = "$cloudRunUrl/api"
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            throw "빌드 실패"
        }
        
        # config.js 파일 업데이트 (빌드 디렉토리에 복사)
        Write-Host "config.js 파일 업데이트 중..." -ForegroundColor Yellow
        $configContent = "window.REACT_APP_API_URL = '$cloudRunUrl/api';"
        $configContent | Out-File -FilePath "build\config.js" -Encoding utf8 -Force
        $configContent | Out-File -FilePath "public\config.js" -Encoding utf8 -Force
        
        # Docker 이미지 빌드 및 배포 (Cloud Build 사용)
        Write-Host "Docker 이미지 빌드 및 업로드 중..." -ForegroundColor Yellow
        $FRONTEND_IMAGE = "gcr.io/$PROJECT_ID/dwfw-frontend:latest"
        gcloud builds submit --tag $FRONTEND_IMAGE --project $PROJECT_ID
        
        if ($LASTEXITCODE -ne 0) {
            throw "이미지 빌드 실패"
        }
        
        # Cloud Run에 배포
        Write-Host "Cloud Run에 배포 중..." -ForegroundColor Yellow
        $FRONTEND_SERVICE = "dwfw-frontend"
        gcloud run deploy $FRONTEND_SERVICE `
            --image $FRONTEND_IMAGE `
            --platform managed `
            --region $REGION `
            --allow-unauthenticated `
            --port 80
        
        if ($LASTEXITCODE -ne 0) {
            throw "Cloud Run 배포 실패"
        }
        
        # 배포된 URL 가져오기
        $frontendUrl = gcloud run services describe $FRONTEND_SERVICE --region $REGION --format "value(status.url)" --project $PROJECT_ID
        
        Write-Host "프론트엔드 배포 완료!" -ForegroundColor Green
        Write-Host "URL: $frontendUrl" -ForegroundColor Cyan
    } catch {
        Write-Host "배포 실패: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
}

# 메인 실행
switch ($Target) {
    "backend" {
        Deploy-Backend
    }
    "frontend" {
        Deploy-Frontend
    }
    "all" {
        Deploy-Backend
        Deploy-Frontend
    }
}

Write-Host "`n=== 배포 완료 ===" -ForegroundColor Green

