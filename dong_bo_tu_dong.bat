@echo off
chcp 65001 >nul
echo =======================================================
echo   🚀 DOCVOCAB - ĐỒNG BỘ TỰ ĐỘNG TỪ GOOGLE DOCS
echo =======================================================
echo.
cd /d "%~dp0"

echo [*] Bước 1: Đang tải và làm giàu dữ liệu từ Google Docs...
python scripts\sync_doc.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Có lỗi xảy ra trong quá trình đồng bộ dữ liệu.
    echo Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [*] Bước 2: Đang tự động lưu trữ và đẩy lên GitHub...
git add -A
git diff --staged --quiet
if %ERRORLEVEL% EQU 0 (
    echo [*] Dữ liệu trên Google Docs và GitHub đã hoàn toàn đồng bộ, không có thay đổi mới!
) else (
    git commit -m "chore(sync): auto-sync vocabulary from Google Docs"
    git push origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo =======================================================
        echo   [THÀNH CÔNG] Dữ liệu từ vựng đã được đẩy lên GitHub!
        echo   Trang web sẽ tự động nhận từ mới trong vòng 30 giây.
        echo =======================================================
    ) else (
        echo.
        echo =======================================================
        echo   [LƯU Ý] Không thể kết nối tới GitHub (timeout mạng).
        echo   Mẹo: Bạn có thể bật 1.1.1.1 (WARP) hoặc phát 4G rồi chạy lại!
        echo =======================================================
    )
)

echo.
pause
