@echo off
title Push Dimsummentai Mamifayy ke GitHub
echo ========================================================
echo   UPLOAD / PUSH PROJECT KE GITHUB REPOSITORY
echo   Repo: https://github.com/arulfahrul1555-star/dimsummentai-mamifayy
echo ========================================================
echo.

set GIT_EXE="C:\Users\acer\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

cd /d "C:\Users\acer\.gemini\antigravity\scratch\dimsummentai-mamifayy"

echo [1/3] Menyiapkan file commit...
%GIT_EXE% add .
%GIT_EXE% commit -m "feat: integrasi Supabase PostgreSQL, deployment Vercel, dan CRM UMKM Mamifayy" 2>nul

echo [2/3] Memeriksa remote origin...
%GIT_EXE% branch -M main
%GIT_EXE% remote set-url origin https://github.com/arulfahrul1555-star/dimsummentai-mamifayy.git 2>nul || %GIT_EXE% remote add origin https://github.com/arulfahrul1555-star/dimsummentai-mamifayy.git

echo [3/3] Melakukan push ke GitHub...
echo (Jika diminta login / username & password/token GitHub, silakan masukkan):
echo.
%GIT_EXE% push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   BERHASIL! PROJECT SUDAH DI-PUSH KE GITHUB!
    echo   Buka https://github.com/arulfahrul1555-star/dimsummentai-mamifayy
    echo ========================================================
) else (
    echo ========================================================
    echo   Catatan Autentikasi GitHub:
    echo   Jika gagal login karena password biasa tidak diterima oleh GitHub,
    echo   gunakan GitHub Personal Access Token (PAT) sebagai password:
    echo   1. Buka https://github.com/settings/tokens
    echo   2. Generate new token (classic) -> centang 'repo'
    echo   3. Salin token tersebut dan paste saat terminal meminta Password.
    echo ========================================================
)

echo.
pause
