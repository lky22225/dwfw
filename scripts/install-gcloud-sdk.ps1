# Google Cloud SDK 설치 스크립트 (Windows PowerShell)
# 관리자 권한으로 실행 필요

Write-Host "=== Google Cloud SDK 설치 시작 ===" -ForegroundColor Green

# 설치 경로 설정
$INSTALL_DIR = "$env:ProgramFiles\Google\Cloud SDK"
$TEMP_DIR = $env:TEMP

# 설치 프로그램 다운로드
Write-Host "설치 프로그램 다운로드 중..." -ForegroundColor Yellow
$INSTALLER_URL = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$INSTALLER_PATH = "$TEMP_DIR\GoogleCloudSDKInstaller.exe"

try {
    Invoke-WebRequest -Uri $INSTALLER_URL -OutFile $INSTALLER_PATH -UseBasicParsing
    Write-Host "다운로드 완료: $INSTALLER_PATH" -ForegroundColor Green
} catch {
    Write-Host "다운로드 실패: $_" -ForegroundColor Red
    exit 1
}

# 설치 프로그램 실행
Write-Host "설치 프로그램 실행 중..." -ForegroundColor Yellow
Write-Host "설치 창에서 다음을 선택하세요:" -ForegroundColor Cyan
Write-Host "  - 모든 컴포넌트 설치" -ForegroundColor Cyan
Write-Host "  - PATH에 추가" -ForegroundColor Cyan

Start-Process -FilePath $INSTALLER_PATH -Wait

# 설치 확인
Write-Host "`n=== 설치 확인 ===" -ForegroundColor Green

# PATH 새로고침
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# gcloud 명령어 확인
try {
    $gcloudVersion = gcloud version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Google Cloud SDK 설치 완료!" -ForegroundColor Green
        Write-Host $gcloudVersion
    } else {
        Write-Host "gcloud 명령어를 찾을 수 없습니다. PowerShell을 재시작하거나 PATH를 확인하세요." -ForegroundColor Yellow
    }
} catch {
    Write-Host "gcloud 명령어 실행 실패: $_" -ForegroundColor Red
    Write-Host "PowerShell을 재시작한 후 다시 시도하세요." -ForegroundColor Yellow
}

Write-Host "`n=== 다음 단계 ===" -ForegroundColor Green
Write-Host "1. PowerShell을 재시작하세요." -ForegroundColor Cyan
Write-Host "2. 다음 명령어로 로그인: gcloud auth login" -ForegroundColor Cyan
Write-Host "3. 프로젝트 설정: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Cyan

