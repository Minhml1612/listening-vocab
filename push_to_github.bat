@echo off
chcp 65001 >nul
echo =======================================================
echo   ĐỒNG BỘ DỰ ÁN DOCVOCAB LÊN GITHUB
echo =======================================================
echo.

cd /d "C:\Users\daole\Documents\Website"

echo [*] Đang đẩy toàn bộ 159 từ vựng chuẩn hóa Google Docs & Oxford lên GitHub...
echo.
git add -A
git commit -m "feat(source): switch data source to standardized Google Doc (v10.0)"
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
