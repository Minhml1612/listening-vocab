# 🚀 DocVocab Quizlet - Ứng Dụng Học Từ Vựng Listening Tự Động Từ Google Docs

> Ứng dụng web học từ vựng tiếng Anh phong cách Quizlet, tự động đồng bộ thời gian thực từ tài liệu Google Docs: **[Tài liệu từ vựng tiếng anh tổng hợp trong các bài listening tự học](https://docs.google.com/document/d/1n9VKp_QEw3ZdIyQCdkU75co8GhAZm1GY/edit)**.

Chạy 100% miễn phí trên **GitHub Pages**, tối ưu hoàn hảo cho điện thoại (iOS / Android) để học mọi lúc mọi nơi trong thời gian rảnh rỗi!

---

## ✨ Tính Năng Nổi Bật

1. **⚡ Đồng bộ Google Docs thời gian thực (Real-time Sync)**:
   - Cứ thêm từ mới hoặc cập nhật trong Google Docs là Web tự động nhận diện.
   - Huy hiệu `✨ MỚI` nổi bật cho các từ mới cập nhật giúp bạn biết ngay từ nào mới học hôm nay.

2. **🧠 Tự động làm giàu từ vựng & Tạo ngữ cảnh thông minh**:
   - **Phiên âm quốc tế (IPA)** chuẩn và phát âm giọng bản xứ (US / UK).
   - Tự động tra nghĩa tiếng Việt, từ loại (n, v, adj), định nghĩa tiếng Anh.
   - Tự động sinh câu ví dụ ngữ cảnh sát với đề thi Listening (IELTS / TOEIC).
   - Tự động tạo câu hỏi trắc nghiệm 4 đáp án theo ngữ cảnh.
   - Hỗ trợ kết nối Google Gemini API (tùy chọn) để giải thích sâu sắc hơn.

3. **🎴 4 Chế Độ Học Chuẩn Quizlet**:
   - **Thẻ Flashcard 3D**: Chạm để lật thẻ mượt mà, vuốt trái "Chưa nhớ" / vuốt phải "Đã thuộc", có chế độ **Rảnh tay (Auto-play)** tự động đọc và lật thẻ khi đang đi bộ, nấu ăn hoặc tập thể dục.
   - **Trắc nghiệm (Quiz Mode)**: Điền từ vào chỗ trống ngữ cảnh, chọn nghĩa đúng, chuỗi trả lời đúng (Streak 🔥) và hiệu ứng pháo hoa khi đạt điểm cao.
   - **Ghép thẻ siêu tốc (Match Game)**: Nối cặp từ tiếng Anh & nghĩa tiếng Việt với đồng hồ đếm giây kỷ lục.
   - **Phòng luyện nghe (Listening Lab)**: Chép chính tả theo âm thanh nghe được, tùy chỉnh tốc độ nói (0.75x, 0.9x, 1.0x), gợi ý ký tự thông minh.

4. **📱 Tối ưu 100% cho Điện Thoại & Ngoại Tuyến (PWA)**:
   - Thanh điều hướng ngón tay cái ở cạnh dưới màn hình.
   - Hỗ trợ chế độ Sáng / Tối (Dark mode).
   - Có thể cài đặt trực tiếp lên màn hình chính điện thoại như ứng dụng native không cần qua App Store!

---

## 🛠️ HƯỚNG DẪN 3 BƯỚC THIẾT LẬP

### BƯỚC 1: Kết Nối Google Docs Thời Gian Thực (Chỉ làm 1 lần mất 1 phút)

Để ứng dụng đọc được tài liệu Google Docs của bạn theo thời gian thực mà không bao giờ bị lỗi bản quyền hay phân quyền truy cập:

1. Mở file Google Docs của bạn: [Tài liệu từ vựng Listening](https://docs.google.com/document/d/1n9VKp_QEw3ZdIyQCdkU75co8GhAZm1GY/edit)
2. Trên thanh menu trên cùng, chọn: **Tiện ích mở rộng (Extensions)** > **Apps Script**.
3. Xóa hết code cũ trong ô soạn thảo, mở file [`google-apps-script/Code.gs`](google-apps-script/Code.gs) trong thư mục này ra và dán toàn bộ vào.
4. Nhấn nút **Lưu (Ctrl + S)**.
5. Nhấn nút xanh **Triển khai (Deploy)** ở góc trên bên phải > Chọn **Tùy chọn triển khai mới (New deployment)**:
   - Loại triển khai: chọn biểu tượng bánh răng ⚙️ > **Ứng dụng web (Web app)**
   - Mô tả: `Vocab Sync API`
   - Thực thi dưới dạng: **Tôi (Me)**
   - Người có quyền truy cập: **Bất kỳ ai (Anyone)** *(Bắt buộc chọn cái này để web trên điện thoại đọc được)*
6. Nhấn **Triển khai (Deploy)**. Nếu Google hiện màn hình ủy quyền tài khoản, bạn bấm *Nâng cao (Advanced)* > *Đi tới... (không an toàn)* > Bấm *Cho phép (Allow)*.
7. Sao chép đường dẫn **URL ứng dụng web** (có đuôi `/exec`).
8. Mở Web học từ vựng > Bấm biểu tượng ⚙️ **Cài đặt** > Dán URL vào ô **URL Google Apps Script Web App** > Bấm **Lưu cài đặt**. Xong!

---

### BƯỚC 2: Đưa Lên GitHub & Kích Hoạt GitHub Pages

1. Tạo một repository mới trên GitHub của bạn (ví dụ đặt tên là `listening-vocab`).
2. Mở Terminal / PowerShell tại thư mục này và chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao web hoc tu vung listening Quizlet"
   git branch -M main
   git remote add origin https://github.com/<USERNAME-CUA-BAN>/listening-vocab.git
   git push -u origin main
   ```
3. Sau khi push lên GitHub:
   - Vào mục **Settings** của repository trên GitHub.
   - Chọn mục **Pages** ở cột menu bên trái.
   - Tại phần **Build and deployment > Source**, chọn **Deploy from a branch**.
   - Mục Branch chọn **main** / thư mục **/(root)** > Nhấn **Save**.
4. Chờ khoảng 1-2 phút, GitHub sẽ cung cấp cho bạn một đường link website vĩnh viễn, ví dụ:
   `https://<username>.github.io/listening-vocab/`

---

### BƯỚC 3: Cài Đặt Lên Điện Thoại Để Học Khi Rảnh

Khi mở link GitHub Pages trên điện thoại:

- **Trên iPhone (Safari)**:
  1. Bấm vào nút **Chia sẻ (Share)** hình ô vuông có mũi tên lên ở cạnh dưới màn hình Safari.
  2. Cuộn xuống chọn **Thêm vào MH chính (Add to Home Screen)**.
  3. Bấm **Thêm (Add)**. Ứng dụng sẽ xuất hiện như một App độc lập trên màn hình chính!

- **Trên Android (Chrome)**:
  1. Bấm vào dấu **3 chấm (⋮)** ở góc trên bên phải Chrome.
  2. Chọn **Cài đặt ứng dụng (Install app)** hoặc **Thêm vào màn hình chính (Add to Home Screen)**.

---

## 📝 Định Dạng Soạn Từ Vựng Trong Google Docs

Bạn có thể viết tự do theo bất kỳ cách nào bạn thích trong Google Docs, hệ thống thông minh sẽ tự động phân tích:

- **Cách 1 (Liệt kê có nghĩa)**:
  ```text
  resilient (adj) : kiên cường, mau phục hồi
  elaborate (v) - giải thích chi tiết, tỉ mỉ
  fluctuate = dao động, biến thiên liên tục
  ```
- **Cách 2 (Bảng - Table)**:
  | Từ vựng | Nghĩa tiếng Việt | Câu ví dụ |
  | :--- | :--- | :--- |
  | unprecedented | chưa từng có tiền lệ | An unprecedented surge in tourism |
  | ambiguous | mơ hồ, đa nghĩa | The instructions were ambiguous |
- **Cách 3 (Chỉ ghi mỗi từ tiếng Anh)**:
  ```text
  diminish
  profound
  counterpart
  ```
  *(Hệ thống sẽ tự động tra cứu từ điển và tự động điền phát âm, nghĩa, câu ví dụ cho bạn!)*

---

Chúc bạn có những giờ phút học từ vựng hiệu quả và nhanh chóng nâng cao kỹ năng Listening! 🎉
