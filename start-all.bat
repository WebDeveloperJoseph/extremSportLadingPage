@echo off
echo ========================================
echo Iniciando Pretinho Variedades
echo ========================================
echo.

REM Inicia o servidor backend em uma nova janela
echo 📦 Iniciando servidor backend (port 3333)...
start "Backend Server" cmd /k "cd server && node server.js"

REM Aguarda um pouco para garantir que o backend iniciou
timeout /t 2 /nobreak

REM Inicia o servidor frontend em uma nova janela
echo 🌐 Iniciando servidor frontend (port 5500)...
start "Frontend Server" cmd /k "cd . && node static-server.js"

REM Aguarda mais um pouco
timeout /t 2 /nobreak

echo.
echo ========================================
echo ✅ Todos os servidores iniciados!
echo ========================================
echo.
echo 🏠 Frontend: http://localhost:5500
echo 📦 Backend:  http://localhost:3333
echo 🎛️  Admin:    http://localhost:5500/admin/
echo.
echo Feche as janelas para parar os servidores
echo.
pause
