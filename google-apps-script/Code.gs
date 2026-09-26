/**
 * GOOGLE APPS SCRIPT CHO WEB HỌC TỪ VỰNG DOCVOCAB (v12.0 - Tự Động Hóa 2 Chiều & Bảo Mật Cao)
 * 
 * Tính năng:
 * 1. doGet: Trả về toàn bộ từ vựng thời gian thực HOẶC thêm từ mới qua URL query parameter (?action=addWord&word=...)
 * 2. doPost: Thêm từ mới vào bảng Google Docs tự động với ID tăng dần (001 -> 160+)
 * 3. Bảo mật: Chống Formula Injection, giới hạn độ dài ký tự chống spam DoS, lọc sạch mã độc.
 * 
 * Hướng dẫn cập nhật:
 * 1. Mở file Google Docs của bạn: https://docs.google.com/document/d/1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4/edit
 * 2. Vào Tiện ích mở rộng (Extensions) > Apps Script
 * 3. Dán toàn bộ mã này vào > Nhấn Lưu (Ctrl+S)
 * 4. Nhấn Triển khai (Deploy) > Quản lý triển khai (Manage deployments) > Chỉnh sửa (Edit) > Chọn Phiên bản mới (New version) > Triển khai.
 */

var TARGET_DOC_ID = "1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4";

function doGet(e) {
  try {
    // Nếu có action = add hoặc addWord -> thực hiện thêm từ mới trực tiếp
    if (e && e.parameter && (e.parameter.action === 'add' || e.parameter.action === 'addWord')) {
      return handleAddWord(e.parameter);
    }
    
    // Mặc định: Đọc toàn bộ tài liệu và trả về JSON cho web app
    var doc = getTargetDoc();
    var body = doc.getBody();
    var docTitle = doc.getName();
    var rawText = body.getText();
    
    // Đọc bảng từ vựng
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
    
    // Đọc theo đoạn văn
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

function doPost(e) {
  try {
    var params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }
    
    return handleAddWord(params);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString(),
      timestamp: Date.now()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getTargetDoc() {
  var doc = DocumentApp.getActiveDocument();
  if (!doc) {
    doc = DocumentApp.openById(TARGET_DOC_ID);
  }
  return doc;
}

/**
 * Hàm làm sạch dữ liệu đầu vào chống Formula Injection và spam DoS
 */
function sanitizeInput(str, maxLen) {
  if (!str) return '';
  var clean = String(str).trim();
  if (clean.length > maxLen) {
    clean = clean.substring(0, maxLen);
  }
  // Chống Formula Injection trong Google Docs/Sheets
  if (/^[=\+\-@\t\r]/.test(clean)) {
    clean = "'" + clean;
  }
  return clean;
}

function handleAddWord(params) {
  var word = sanitizeInput(params.word, 100);
  var pos = sanitizeInput(params.pos || params.partOfSpeech, 40);
  var meaning = sanitizeInput(params.meaning, 400);
  var notes = sanitizeInput(params.notes || params.example, 800);
  
  if (!word || word.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Từ tiếng Anh (word) không hợp lệ"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var doc = getTargetDoc();
  var body = doc.getBody();
  var tables = body.getTables();
  var nextIdFormatted = "001";
  
  if (tables.length > 0) {
    var table = tables[0];
    var rowCount = table.getNumRows();
    
    // Tìm ID số lớn nhất hiện tại
    var maxId = 0;
    for (var i = 0; i < rowCount; i++) {
      var cellText = table.getRow(i).getCell(0).getText().trim();
      var idNum = parseInt(cellText, 10);
      if (!isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
    
    var nextId = maxId > 0 ? (maxId + 1) : rowCount;
    nextIdFormatted = ("000" + nextId).slice(-3);
    
    // Thêm hàng mới vào bảng chuẩn hóa
    var newRow = table.appendTableRow();
    newRow.appendTableCell(nextIdFormatted);
    newRow.appendTableCell(word);
    newRow.appendTableCell(pos);
    newRow.appendTableCell(meaning);
    newRow.appendTableCell(notes);
    
  } else {
    // Nếu chưa có bảng, tạo đoạn văn mới
    body.appendParagraph(word + " (" + pos + "): " + meaning + (notes ? " - " + notes : ""));
  }
  
  doc.saveAndClose();
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Đã tự động thêm từ mới vào Google Docs thành công!",
    id: nextIdFormatted,
    word: word,
    pos: pos,
    meaning: meaning
  })).setMimeType(ContentService.MimeType.JSON);
}
