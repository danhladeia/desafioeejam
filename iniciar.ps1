$ErrorActionPreference = 'Stop'
$dueloRoot = $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'O Node.js precisa estar instalado para abrir o jogo.'
    Read-Host 'Pressione Enter para fechar'
    exit 1
}
$dueloRunning = $false
try {
    $dueloResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:4173' -UseBasicParsing -TimeoutSec 2
    $dueloRunning = $dueloResponse.Content -match 'Duelo do Futuro'
} catch {}
if (-not $dueloRunning) {
    Start-Process -FilePath (Get-Command node).Source -ArgumentList 'server.js' -WorkingDirectory $dueloRoot -WindowStyle Hidden
    for ($dueloAttempt = 0; $dueloAttempt -lt 20; $dueloAttempt++) {
        try {
            $dueloResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:4173' -UseBasicParsing -TimeoutSec 1
            if ($dueloResponse.Content -match 'Duelo do Futuro') { $dueloRunning = $true; break }
        } catch {}
        Start-Sleep -Milliseconds 250
    }
}
if ($dueloRunning) { Start-Process 'http://127.0.0.1:4173' }
else { Write-Host 'Não foi possível abrir o jogo. A porta 4173 pode estar ocupada.'; Read-Host 'Pressione Enter para fechar' }
