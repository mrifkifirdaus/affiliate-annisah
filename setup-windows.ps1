$ErrorActionPreference = "Stop"

Write-Host "Checking Node.js and npm..." -ForegroundColor Cyan
node --version
npm --version

if (-not (Test-Path "apps\api\.env")) {
  Copy-Item "apps\api\.env.example" "apps\api\.env"
  Write-Host "Created apps\api\.env" -ForegroundColor Green
}

if (-not (Test-Path "apps\web\.env")) {
  Copy-Item "apps\web\.env.example" "apps\web\.env"
  Write-Host "Created apps\web\.env" -ForegroundColor Green
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  Write-Host "Starting PostgreSQL with Docker..." -ForegroundColor Cyan
  docker compose up -d
} else {
  Write-Warning "Docker was not found. Ensure PostgreSQL is running and DATABASE_URL is correct before continuing."
}

Write-Host "Preparing database..." -ForegroundColor Cyan
npm run db:generate
npm run db:deploy
npm run db:seed

Write-Host "Setup completed. Run: npm run dev" -ForegroundColor Green
