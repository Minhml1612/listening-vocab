@echo off
chcp 65001 >nul
echo =======================================================
echo   ĐỒNG BỘ DỰ ÁN DOCVOCAB LÊN GITHUB
echo =======================================================
echo.

cd /d "C:\Users\daole\Documents\Website"

echo [*] Đang kiểm tra thư mục hiện tại: %cd%
echo [*] Đang đẩy toàn bộ 155 từ vựng Oxford và bộ Quiz lên GitHub...
echo.

git push -f origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo   [THÀNH CÔNG] Đã đẩy dữ liệu lên GitHub thành công!
    echo   Trang web sẽ tự cập nhật trong vòng 1-2 phút.
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo   [LƯU Ý] Kết nối tới GitHub bị gián đoạn (timeout mạng).
    echo   Mẹo: Bạn hãy thử bật WARP (1.1.1.1) hoặc phát 4G rồi chạy lại nhé!
    echo =======================================================
)

echo.
pause
