# 백엔드 URL 확인 스크립트

Write-Host "=== 백엔드 URL 확인 ===" -ForegroundColor Green

# PATH 설정
$env:Path += ";$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin"

try {
    # 백엔드 서비스 URL 확인
    $backendUrl = gcloud run services describe dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --format "value(status.url)" 2>$null
    
    if ($backendUrl) {
        Write-Host "`n✅ 현재 배포된 백엔드 URL:" -ForegroundColor Green
        Write-Host "   $backendUrl" -ForegroundColor Cyan
        Write-Host "`nAPI 엔드포인트:" -ForegroundColor Yellow
        Write-Host "   $backendUrl/api" -ForegroundColor Cyan
        
        # config.js 파일 확인
        $configPath = "D:\DwFw\frontend\public\config.js"
        if (Test-Path $configPath) {
            $configContent = Get-Content $configPath -Raw
            Write-Host "`n현재 config.js 설정:" -ForegroundColor Yellow
            Write-Host $configContent -ForegroundColor Gray
            
            if ($configContent -match "window\.REACT_APP_API_URL\s*=\s*['`"]([^'`"]+)['`"]") {
                $configUrl = $matches[1]
                Write-Host "`nconfig.js의 API URL: $configUrl" -ForegroundColor Cyan
                
                if ($configUrl -ne "$backendUrl/api") {
                    Write-Host "`n⚠️  경고: config.js의 URL이 실제 백엔드 URL과 다릅니다!" -ForegroundColor Yellow
                    Write-Host "config.js를 업데이트하시겠습니까? (Y/N)" -ForegroundColor Yellow
                    $response = Read-Host
                    if ($response -eq 'Y' -or $response -eq 'y') {
                        $newConfig = "window.REACT_APP_API_URL = '$backendUrl/api';"
                        $newConfig | Out-File -FilePath $configPath -Encoding utf8 -NoNewline
                        Write-Host "✅ config.js가 업데이트되었습니다." -ForegroundColor Green
                    }
                } else {
                    Write-Host "✅ config.js의 URL이 올바릅니다." -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "❌ 백엔드 서비스를 찾을 수 없습니다." -ForegroundColor Red
        Write-Host "다음 명령어로 모든 서비스를 확인하세요:" -ForegroundColor Yellow
        Write-Host "   gcloud run services list --region asia-northeast3 --project friendly-aura-477305-g3" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ 오류 발생: $_" -ForegroundColor Red
    Write-Host "`n수동으로 확인하려면:" -ForegroundColor Yellow
    Write-Host "   gcloud run services describe dwfw-backend --region asia-northeast3 --project friendly-aura-477305-g3 --format 'value(status.url)'" -ForegroundColor Cyan
}



