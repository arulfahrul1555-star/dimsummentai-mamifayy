@echo off
title Dimsummentai Mamifayy - Server Lokal
echo ========================================================
echo   MENJALANKAN APLIKASI DIMSUMMENTAI MAMIFAYY...
echo ========================================================
echo.
echo Server akan otomatis terbuka di browser Anda: http://localhost:3000
echo Jangan tutup jendela hitam (terminal) ini selama menggunakan web.
echo.
cd /d "%~dp0"
start http://localhost:3000
call npm.cmd run dev
pause
