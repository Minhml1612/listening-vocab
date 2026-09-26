/**
 * GOOGLE APPS SCRIPT CHO WEB HỌC TỪ VỰNG QUIZLET
 * 
 * Hướng dẫn 3 bước đơn giản:
 * 1. Mở file Google Docs của bạn: https://docs.google.com/document/d/1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4/edit
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) > Apps Script
 * 3. Xoá code cũ, dán toàn bộ nội dung file này vào > Nhấn Lưu (Ctrl + S)
 * 4. Nhấn nút "Triển khai" (Deploy) ở góc trên bên phải > Chọn "Tùy chọn triển khai mới" (New deployment)
 * 5. Chọn loại triển khai: "Ứng dụng web" (Web app)
 *    - Mô tả: Vocab Sync API
 *    - Thực thi dưới dạng: Tôi (Me - email của bạn)
 *    - Người có quyền truy cập: Bất kỳ ai (Anyone)  <-- Quan trọng để web trên điện thoại đọc được
 * 6. Nhấn "Triển khai" (Deploy), cấp quyền nếu Google hỏi, rồi sao chép URL ứng dụng web (dạng https://script.google.com/macros/s/.../exec)
 * 7. Dán URL đó vào ô Cài đặt trong Web học từ vựng là xong! Cứ cập nhật gì trong Docs là Web tự động nhận từ mới.
 */

function doGet(e) {
  try {
    var doc = DocumentApp.getActiveDocument();
    if (!doc) {
      // Nếu chạy standalone mà không gắn với doc, thử mở theo ID
      var docId = "1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4";
      doc = DocumentApp.openById(docId);
    }
    
    var body = doc.getBody();
    var docTitle = doc.getName();
    var rawText = body.getText();
    
    // Đọc tất cả các bảng nếu bạn lưu từ theo dạng bảng
    var tables = body.getTables();
    var tableRows = [];
    for (var t = 0; t < tables.length; t++) {
      var table = tables[t];
      var numRows = table.getNumRows();
      for (var r = 0; r < numRows; r++) {
        var row = table.getRow(r);
        var numCells = row.getNumCells();
        var cells = [];
        for (var c = 0; c < numCells; c++) {
          cells.push(row.getCell(c).getText().trim());
        }
        if (cells.some(function(item) { return item.length > 0; })) {
          tableRows.push(cells);
        }
      }
    }
    
    // Đọc theo từng đoạn văn (paragraphs / bullet points)
    var paragraphs = body.getParagraphs();
    var lines = [];
    for (var p = 0; p < paragraphs.length; p++) {
      var pText = paragraphs[p].getText().trim();
      if (pText.length > 0) {
        lines.push(pText);
      }
    }
    
    var responseData = {
      status: "success",
      title: docTitle,
      lastModified: new Date().toISOString(),
      timestamp: Date.now(),
      rawText: rawText,
      lines: lines,
      tableRows: tableRows
    };
    
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString(),
      timestamp: Date.now()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
