# Regenerate swaggo Swagger docs and the TypeScript SDK / TanStack Query options
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)))
Set-Location $rootDir

Write-Host "==> Generating Swagger docs from Go annotations (swaggo)..." -ForegroundColor Cyan
Set-Location "$rootDir/backend"
swag init -g cmd/api/main.go -o ./docs --parseDependency --parseInternal --useStructName --requiredByDefault

Write-Host "==> Generating TypeScript SDK & TanStack Query options (hey-api)..." -ForegroundColor Cyan
Set-Location "$rootDir/frontend"
npm run api

Write-Host "==> Verifying frontend build..." -ForegroundColor Cyan
npm run build

Write-Host "==> SDK generation completed successfully!" -ForegroundColor Green
