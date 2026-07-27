# Google Cloud SDK PATH 설정 스크립트
# 이 스크립트를 실행하면 현재 세션에서 gcloud 명령을 사용할 수 있습니다.

Write-Host "=== Google Cloud SDK PATH 설정 ===" -ForegroundColor Green

# 가능한 설치 경로들 확인
$possiblePaths = @(
    "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin",
    "$env:ProgramFiles\Google\Cloud SDK\google-cloud-sdk\bin",
    "$env:ProgramFiles(x86)\Google\Cloud SDK\google-cloud-sdk\bin"
)

$gcloudPath = $null

foreach ($path in $possiblePaths) {
    if (Test-Path "$path\gcloud.cmd") {
        $gcloudPath = $path
        Write-Host "gcloud를 찾았습니다: $path" -ForegroundColor Green
        break
    }
}

if (-not $gcloudPath) {
    Write-Host "경고: gcloud를 찾을 수 없습니다. 다음 경로를 확인하세요:" -ForegroundColor Yellow
    foreach ($path in $possiblePaths) {
        Write-Host "  - $path" -ForegroundColor Yellow
    }
    Write-Host "`n수동으로 설치 경로를 찾으려면 다음 명령어를 실행하세요:" -ForegroundColor Cyan
    Write-Host "  Get-ChildItem -Path `"$env:LOCALAPPDATA\Google`" -Recurse -Filter `"gcloud.cmd`" -ErrorAction SilentlyContinue" -ForegroundColor Cyan
    exit 1
}

# 현재 세션의 PATH에 추가
$env:Path += ";$gcloudPath"

Write-Host "`n현재 세션에 PATH가 추가되었습니다." -ForegroundColor Green
Write-Host "영구적으로 설정하려면 시스템 환경 변수에 추가하세요." -ForegroundColor Yellow

# gcloud 확인
Write-Host "`n=== gcloud 버전 확인 ===" -ForegroundColor Green
try {
    $version = & gcloud version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $version -ForegroundColor Green
        Write-Host "`n✅ gcloud가 정상적으로 작동합니다!" -ForegroundColor Green
    } else {
        Write-Host "gcloud 실행 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "gcloud 실행 실패: $_" -ForegroundColor Red
}

# 영구 설정 안내
Write-Host "`n=== 영구적으로 PATH 설정하기 ===" -ForegroundColor Cyan
Write-Host "시스템 환경 변수에 영구적으로 추가하려면:" -ForegroundColor Yellow
Write-Host "1. '시스템 속성' > '고급' > '환경 변수' 열기" -ForegroundColor Yellow
Write-Host "2. 'Path' 변수 선택 > '편집'" -ForegroundColor Yellow
Write-Host "3. 다음 경로 추가: $gcloudPath" -ForegroundColor Yellow
Write-Host "`n또는 PowerShell에서 관리자 권한으로 실행:" -ForegroundColor Yellow
Write-Host "  [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';$gcloudPath', 'User')" -ForegroundColor Cyan



