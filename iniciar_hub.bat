@echo off
title Portal de Jogos - JasDEV Hub
cd /d "c:\Users\Mine Vic\projetos\game-hub-jasdev"
cls
echo ========================================================
echo        PORTAL DE JOGOS JASDEV (DESKTOP E CELULAR)
echo ========================================================
echo.
echo [1/3] Abrindo o portal no navegador do computador...
start http://localhost:3000
echo.
echo [2/3] Servidor online e disponivel para computadores e celulares!
echo.
echo --------------------------------------------------------
echo   COMO JOGAR NO CELULAR (no mesmo Wi-Fi):
echo   Abra o navegador do seu celular (Chrome/Safari) e digite:
echo.
echo   http://192.168.1.13:3000
echo.
echo --------------------------------------------------------
echo   ATENCAO: Mantenha esta janelinha aberta enquanto joga!
echo   Para fechar o servidor, basta fechar esta janela.
echo --------------------------------------------------------
echo.
c:\python311\python.exe -m http.server 3000 --bind 0.0.0.0
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [AVISO] Porta 3000 ocupada, tentando porta 5000...
    start http://localhost:5000
    echo   No celular acesse: http://192.168.1.13:5000
    c:\python311\python.exe -m http.server 5000 --bind 0.0.0.0
)
pause
