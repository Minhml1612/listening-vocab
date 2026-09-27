/**
 * AUTH & MULTI-USER STORAGE MANAGER (v1.0)
 * Quản lý đăng nhập Gmail, phân vùng kho từ vựng cá nhân & hướng dẫn tạo Google Docs
 */

const APPS_SCRIPT_TEMPLATE = `/**
 * GOOGLE APPS SCRIPT CHO WEB HỌC TỪ VỰNG DOCVOCAB (v12.0 - Tự Động Hóa 2 Chiều & Bảo Mật Cao)
 * 
 * Tính năng:
 * 1. doGet: Trả về toàn bộ từ vựng thời gian thực HOẶC thêm từ mới qua URL query parameter (?action=addWord&word=...)
 * 2. doPost: Thêm từ mới vào bảng Google Docs tự động với ID tăng dần (001 -> 160+)
 * 3. Bảo mật: Chống Formula Injection, giới hạn độ dài ký tự chống spam DoS, lọc sạch mã độc.
 * 
 * Hướng dẫn:
 * 1. Mở file Google Docs của bạn
 * 2. Vào Tiện ích mở rộng (Extensions) > Apps Script
 * 3. Dán toàn bộ mã này vào > Nhấn Lưu (Ctrl+S)
 * 4. Nhấn Triển khai (Deploy) > Triển khai mới (New deployment) > Chọn Ứng dụng web (Web app)
 * 5. Mục 'Ai có quyền truy cập' (Who has access): Chọn 'Bất kỳ ai' (Anyone) > Nhấn Triển khai.
 * 6. Sao chép URL Web App dạng https://script.google.com/macros/s/.../exec và dán vào DocVocab!
 */

var TARGET_DOC_ID = ""; // Tự động lấy file hiện tại

function doGet(e) {
  try {
    if (e && e.parameter && (e.parameter.action === 'add' || e.parameter.action === 'addWord')) {
      return handleAddWord(e.parameter);
    }
    
    var doc = getTargetDoc();
    var body = doc.getBody();
    var docTitle = doc.getName();
    var rawText = body.getText();
    
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
  if (!doc && TARGET_DOC_ID) {
    doc = DocumentApp.openById(TARGET_DOC_ID);
  }
  return doc;
}

function sanitizeInput(str, maxLen) {
  if (!str) return '';
  var clean = String(str).trim();
  if (clean.length > maxLen) {
    clean = clean.substring(0, maxLen);
  }
  if (/^[=\\+\\-@\\t\\r]/.test(clean)) {
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
    
    // Kiểm tra xem từ này đã có trong bảng chưa (chống trùng lặp dòng)
    var wordLower = word.toLowerCase();
    for (var i = 0; i < rowCount; i++) {
      var row = table.getRow(i);
      var numCells = row.getNumCells();
      if (numCells >= 2) {
        var existingWord = row.getCell(1).getText().trim().toLowerCase();
        if (existingWord === wordLower) {
          if (meaning && numCells >= 4 && !row.getCell(3).getText().trim()) {
            row.getCell(3).setText(meaning);
          }
          if (notes && numCells >= 5 && !row.getCell(4).getText().trim()) {
            row.getCell(4).setText(notes);
          }
          doc.saveAndClose();
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "Từ đã tồn tại trong Google Docs (đã kiểm tra và cập nhật)",
            id: row.getCell(0).getText().trim(),
            word: word,
            isExisting: true
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

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
    
    var newRow = table.appendTableRow();
    newRow.appendTableCell(nextIdFormatted);
    newRow.appendTableCell(word);
    newRow.appendTableCell(pos);
    newRow.appendTableCell(meaning);
    newRow.appendTableCell(notes);
    
  } else {
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
}`;

class AuthManager {
  constructor() {
    this.currentUser = window.appStorage ? window.appStorage.currentUser : null;
    this.accounts = this.loadAccounts();
    this.init();
  }

  loadAccounts() {
    try {
      const raw = localStorage.getItem('docvocab_accounts_list');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveAccounts() {
    try {
      localStorage.setItem('docvocab_accounts_list', JSON.stringify(this.accounts));
    } catch (e) {}
  }

  init() {
    // Lắng nghe thay đổi trạng thái đăng nhập
    window.addEventListener('auth:changed', (e) => {
      this.currentUser = e.detail;
      this.renderHeaderAuth();
      this.renderSettingsAccountCard();
    });

    // Render nút trên thanh Header khi DOM sẵn sàng
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.renderHeaderAuth());
    } else {
      this.renderHeaderAuth();
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  escapeJsString(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
  }

  sanitizeAvatarUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const clean = url.trim();
    // Chấp nhận HTTP/HTTPS an toàn, lọc ký tự phá vỡ HTML attribute
    if (/^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/i.test(clean)) {
      return clean.replace(/["'<>]/g, '');
    }
    // Chấp nhận base64 image an toàn từ canvas hoặc upload
    if (/^data:image\/(jpeg|png|webp|gif);base64,[a-zA-Z0-9+/=]+$/i.test(clean)) {
      return clean;
    }
    return '';
  }

  renderAvatarElement(user, sizeClass = 'w-10 h-10', textClass = 'text-base') {
    if (!user) {
      return `<div class="${sizeClass} rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold ${textClass} text-slate-500 flex-shrink-0 aspect-square">?</div>`;
    }
    const email = user.email || '';
    const initial = ((user.name || email).charAt(0) || 'U').toUpperCase();
    const avatar = (user.avatar || '').trim();
    const safeName = this.escapeHtml(user.name || 'Avatar');
    const safeInitial = this.escapeHtml(initial);
    const sanitizedUrl = this.sanitizeAvatarUrl(avatar);

    if (sanitizedUrl) {
      return `<img src="${sanitizedUrl}" alt="${safeName}" referrerpolicy="no-referrer" loading="lazy" class="${sizeClass} rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 aspect-square" onerror="this.onerror=null;this.outerHTML='<div class=\\'${sizeClass} rounded-2xl bg-gradient-to-tr from-[#4255FF] to-[#7383FF] text-white flex items-center justify-center font-black ${textClass} uppercase shadow-md flex-shrink-0 aspect-square\\'>${safeInitial}</div>';" />`;
    } else if (avatar && avatar.length > 0 && !avatar.startsWith('{')) {
      const safeEmoji = this.escapeHtml(avatar.slice(0, 10));
      return `<div class="${sizeClass} rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-100 dark:from-[#252945] dark:to-[#1A1D36] border border-blue-200 dark:border-blue-900/60 flex items-center justify-center ${textClass} shadow-sm select-none flex-shrink-0 aspect-square">${safeEmoji}</div>`;
    } else {
      return `<div class="${sizeClass} rounded-2xl bg-gradient-to-tr from-[#4255FF] to-[#7383FF] text-white flex items-center justify-center font-black ${textClass} uppercase shadow-md flex-shrink-0 aspect-square">${safeInitial}</div>`;
    }
  }

  renderHeaderAuth() {
    const container = document.getElementById('header-auth-container');
    if (!container) return;

    if (!this.currentUser || !this.currentUser.email) {
      // Chưa đăng nhập: Nút Đăng nhập Gmail
      container.innerHTML = `
        <button id="btn-login-header" onclick="window.appAuth.openLoginModal()" 
          class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1D36] hover:bg-blue-50 dark:hover:bg-[#252945] border border-slate-200 dark:border-[#282E4E] hover:border-blue-400 dark:hover:border-blue-500 text-[#2E3856] dark:text-[#F6F7FB] text-xs font-bold active:scale-95 transition-all shadow-xs group" 
          title="Đăng nhập Gmail để sở hữu kho từ vựng và Google Docs riêng">
          <svg class="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span class="hidden sm:inline">Đăng nhập</span>
          <span class="sm:hidden">Gmail</span>
        </button>
      `;
    } else {
      // Đã đăng nhập: Nút Avatar Pill kho cá nhân
      const email = this.currentUser.email;
      const displayName = this.currentUser.name || email.split('@')[0];

      container.innerHTML = `
        <button id="btn-profile-header" onclick="window.appAuth.openProfileModal()" 
          class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#252945] hover:bg-slate-200 dark:hover:bg-[#2e3458] border border-slate-200/80 dark:border-slate-700/80 text-[#2E3856] dark:text-[#F6F7FB] text-xs font-semibold active:scale-95 transition-all group" 
          title="Kho cá nhân: ${email} (Nhấp để quản lý hoặc đổi ảnh đại diện)">
          ${this.renderAvatarElement(this.currentUser, 'w-6 h-6', 'text-[11px]')}
          <span class="hidden sm:inline max-w-[85px] md:max-w-[110px] truncate text-xs font-bold">${displayName}</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#252945]" title="Kho lưu trữ riêng đang hoạt động"></span>
        </button>
      `;
    }
  }

  renderSettingsAccountCard() {
    const cardEl = document.getElementById('settings-account-card');
    if (!cardEl) return;

    if (!this.currentUser || !this.currentUser.email) {
      cardEl.innerHTML = `
        <div class="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-bold text-sm text-[#2E3856] dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Chưa đăng nhập (Chế độ Khách)</span>
            </h4>
            <p class="text-xs text-[#586380] dark:text-[#939BB4] mt-0.5">
              Đăng nhập Gmail để sở hữu kho lưu trữ từ vựng riêng biệt và tự động đồng bộ Google Docs.
            </p>
          </div>
          <button onclick="window.appAuth.openLoginModal()" class="px-4 py-2 bg-[#4255FF] hover:bg-[#3644D9] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Đăng nhập Gmail ngay</span>
          </button>
        </div>
      `;
    } else {
      const email = this.currentUser.email;
      const displayName = this.currentUser.name || email.split('@')[0];
      const wordCount = window.appStorage ? window.appStorage.words.length : 0;

      cardEl.innerHTML = `
        <div class="p-4 bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div onclick="window.appAuth.openAvatarPicker()" class="cursor-pointer group relative" title="Nhấp để đổi avatar">
              ${this.renderAvatarElement(this.currentUser, 'w-10 h-10', 'text-base')}
              <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-[#1A1D36] border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-[9px] shadow-xs text-[#4255FF]">✏️</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-[#2E3856] dark:text-white">${displayName}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase tracking-wider">Kho cá nhân</span>
              </div>
              <p class="text-xs text-[#586380] dark:text-[#939BB4] mt-0.5">${email} • ${wordCount} từ vựng trong kho</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.appAuth.openAvatarPicker()" class="px-3 py-1.5 bg-slate-100 dark:bg-[#252945] hover:bg-slate-200 dark:hover:bg-[#2e3458] text-[#2E3856] dark:text-[#F6F7FB] rounded-xl text-xs font-semibold active:scale-95 transition-all">
              Đổi avatar
            </button>
            <button onclick="window.appAuth.openProfileModal()" class="px-3 py-1.5 bg-slate-100 dark:bg-[#252945] hover:bg-slate-200 dark:hover:bg-[#2e3458] text-[#2E3856] dark:text-[#F6F7FB] rounded-xl text-xs font-semibold active:scale-95 transition-all">
              Quản lý kho
            </button>
            <button onclick="window.appAuth.openDocsGuideModal(1)" class="px-3 py-1.5 bg-[#4255FF] hover:bg-[#3644D9] text-white rounded-xl text-xs font-bold active:scale-95 transition-all">
              Hướng dẫn Google Docs
            </button>
          </div>
        </div>
      `;
    }
  }

  openLoginModal() {
    let modal = document.getElementById('modal-auth-login');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-auth-login';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200';
      document.body.appendChild(modal);
    }

    const previousAccountsHtml = this.accounts.length > 0 ? `
      <div class="mb-4">
        <label class="block text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-2">
          Tài khoản đã dùng trên thiết bị này:
        </label>
        <div class="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
          ${this.accounts.map(acc => {
            return `
              <div onclick="window.appAuth.loginWithEmail('${this.escapeJsString(acc.email)}', '${this.escapeJsString(acc.name || '')}')" 
                class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0A092D] hover:bg-blue-50 dark:hover:bg-[#252945] border border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#4255FF] cursor-pointer transition-all">
                <div class="flex items-center gap-2.5 min-w-0">
                  ${this.renderAvatarElement(acc, 'w-7 h-7', 'text-[11px]')}
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-[#2E3856] dark:text-white truncate">${acc.email}</p>
                  </div>
                </div>
                <span class="text-[11px] font-bold text-[#4255FF] flex-shrink-0">Vào kho &rarr;</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="relative my-4 flex items-center justify-center">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-[#E5E8EF] dark:border-[#282E4E]"></div></div>
        <span class="relative px-3 bg-white dark:bg-[#1A1D36] text-[11px] uppercase font-bold text-[#586380] dark:text-[#939BB4]">Hoặc đăng nhập tài khoản khác</span>
      </div>
    ` : '';

    modal.innerHTML = `
      <div class="w-full max-w-md bg-white dark:bg-[#1A1D36] rounded-3xl border border-[#E5E8EF] dark:border-[#282E4E] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <!-- Nút đóng -->
        <button onclick="window.appAuth.closeLoginModal()" class="absolute top-5 right-5 p-2 rounded-xl text-[#586380] dark:text-[#939BB4] hover:bg-slate-100 dark:hover:bg-[#252945] transition-colors" title="Đóng">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3 mb-5">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#252945] border border-blue-200 dark:border-blue-900/60 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-[#2E3856] dark:text-white">Đăng nhập Kho Cá Nhân</h3>
            <p class="text-xs text-[#586380] dark:text-[#939BB4]">Mỗi tài khoản Gmail sở hữu kho từ vựng riêng biệt</p>
          </div>
        </div>

        ${previousAccountsHtml}

        <!-- Form nhập Gmail -->
        <form onsubmit="window.appAuth.handleLoginSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-1.5">
              Địa chỉ Gmail của bạn
            </label>
            <div class="relative">
              <input id="input-auth-email" type="email" required placeholder="nhap.email.cua.ban@gmail.com" 
                class="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A092D] border border-[#E5E8EF] dark:border-[#282E4E] rounded-xl text-sm font-medium focus:outline-none focus:border-[#4255FF] text-[#2E3856] dark:text-white transition-colors" />
            </div>
            <p class="text-[11px] text-[#586380] dark:text-[#939BB4] mt-1.5 leading-relaxed">
              * Dữ liệu từ vựng, điểm số, thẻ nhớ và file Google Docs được lưu trữ độc lập theo tài khoản này.
            </p>
          </div>

          <button type="submit" 
            class="w-full py-3.5 bg-[#4255FF] hover:bg-[#3644D9] text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2">
            <span>Tiếp tục với Gmail</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>

        <div class="mt-4 pt-3 border-t border-[#E5E8EF] dark:border-[#282E4E] text-center">
          <button onclick="window.appAuth.openDocsGuideModal(1); window.appAuth.closeLoginModal();" 
            class="text-xs font-semibold text-[#4255FF] hover:underline inline-flex items-center gap-1">
            <span>📖 Bạn là người mới? Xem hướng dẫn tạo file Google Docs</span>
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => {
      const input = document.getElementById('input-auth-email');
      if (input) input.focus();
    }, 100);
  }

  closeLoginModal() {
    const modal = document.getElementById('modal-auth-login');
    if (modal) modal.classList.add('hidden');
  }

  handleLoginSubmit(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('input-auth-email');
    if (!input) return;
    const email = input.value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }

    this.loginWithEmail(email);
  }

  loginWithEmail(email, name = '') {
    const cleanEmail = email.trim().toLowerCase();
    const isNew = !this.accounts.some(a => a.email.toLowerCase() === cleanEmail);

    let existingAccount = this.accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (!existingAccount) {
      existingAccount = {
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        avatar: '',
        docId: '',
        scriptUrl: '',
        joinedAt: Date.now(),
        lastLogin: Date.now()
      };
      this.accounts.push(existingAccount);
    } else {
      existingAccount.lastLogin = Date.now();
      if (name) existingAccount.name = name;
    }
    this.saveAccounts();

    // Chuyển kho lưu trữ cho user này
    window.appStorage.switchUser(existingAccount);
    this.currentUser = existingAccount;

    this.closeLoginModal();
    this.renderHeaderAuth();
    this.renderSettingsAccountCard();

    // Thông báo cho người dùng
    if (isNew) {
      if (window.appRouter && typeof window.appRouter.showToast === 'function') {
        window.appRouter.showToast(`Chào mừng bạn mới ${existingAccount.name}! Đang mở hướng dẫn tạo Google Docs...`, 'success');
      }
      setTimeout(() => {
        this.openDocsGuideModal(1);
      }, 400);
    } else {
      if (window.appRouter && typeof window.appRouter.showToast === 'function') {
        window.appRouter.showToast(`Đã chuyển sang kho từ vựng của ${existingAccount.email}`, 'success');
      }
    }
  }

  logout() {
    window.appStorage.switchUser(null);
    this.currentUser = null;
    this.closeProfileModal();
    this.renderHeaderAuth();
    this.renderSettingsAccountCard();

    if (window.appRouter && typeof window.appRouter.showToast === 'function') {
      window.appRouter.showToast('Đã đăng xuất. Bạn đang ở chế độ kho từ vựng Khách.', 'info');
    }
  }

  openProfileModal() {
    if (!this.currentUser || !this.currentUser.email) {
      this.openLoginModal();
      return;
    }

    let modal = document.getElementById('modal-auth-profile');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-auth-profile';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200';
      document.body.appendChild(modal);
    }

    const email = this.currentUser.email;
    const displayName = this.currentUser.name || email.split('@')[0];
    const settings = window.appStorage ? window.appStorage.settings : {};
    const wordCount = window.appStorage ? window.appStorage.words.length : 0;
    const currentDocId = settings.docId || this.currentUser.docId || '';
    const hasValidDocId = currentDocId && currentDocId.length >= 20;

    modal.innerHTML = `
      <div class="w-full max-w-lg bg-white dark:bg-[#1A1D36] rounded-3xl border border-[#E5E8EF] dark:border-[#282E4E] shadow-2xl p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <!-- Nút đóng đặt tách biệt rõ ràng, không bao giờ che lấp nhãn ĐANG DÙNG trên mobile -->
        <button onclick="window.appAuth.closeProfileModal()" class="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] dark:hover:bg-[#2e3458] text-[#586380] dark:text-[#939BB4] flex items-center justify-center transition-colors shadow-sm" title="Đóng">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <!-- Header Profile: Có padding-right 48px (pr-12) bảo đảm không bị đè bởi nút đóng trên mọi dòng điện thoại -->
        <div class="flex items-center gap-3.5 mb-5 pb-4 border-b border-[#E5E8EF] dark:border-[#282E4E] pr-12">
          <!-- Avatar: Bấm vào để đổi avatar -->
          <div onclick="window.appAuth.openAvatarPicker()" class="relative group cursor-pointer flex-shrink-0" title="Nhấp để đổi ảnh đại diện">
            ${this.renderAvatarElement(this.currentUser, 'w-14 h-14', 'text-2xl')}
            <div class="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span class="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-[#1A1D36] border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-[10px] shadow-sm text-[#4255FF]">✏️</span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-base font-black text-[#2E3856] dark:text-white truncate max-w-[130px] sm:max-w-none">${displayName}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase whitespace-nowrap">Đang dùng</span>
            </div>
            <p class="text-xs text-[#586380] dark:text-[#939BB4] truncate font-medium mt-0.5">${email}</p>
            <div class="flex items-center gap-2.5 mt-1">
              <span class="text-[11px] text-[#4255FF] font-semibold">${wordCount} từ vựng</span>
              <button onclick="window.appAuth.openAvatarPicker()" class="text-[11px] font-bold text-[#4255FF] dark:text-[#7383FF] hover:underline flex items-center gap-1">
                <span>📷 Đổi avatar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Khối Thông Tin Kho Google Docs -->
        <div class="space-y-3 mb-5">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A092D] border border-[#E5E8EF] dark:border-[#282E4E]">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-bold uppercase text-[#586380] dark:text-[#939BB4] flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-[#4255FF]" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <span>Google Docs Kết Nối:</span>
              </span>
              <button onclick="window.appSync.sync(); window.appAuth.closeProfileModal();" class="text-xs font-bold text-[#4255FF] hover:underline flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Đồng bộ ngay</span>
              </button>
            </div>
            <p class="text-xs font-mono text-[#2E3856] dark:text-slate-200 truncate bg-white dark:bg-[#1A1D36] p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
              ${currentDocId || 'Chưa thiết lập'}
            </p>

            ${hasValidDocId ? `
              <div class="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <a href="https://docs.google.com/document/d/${encodeURIComponent(currentDocId)}/edit" target="_blank" rel="noopener noreferrer" 
                  class="text-xs font-bold text-[#4255FF] dark:text-[#7383FF] hover:underline inline-flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  <span>Mở chỉnh sửa trực tiếp trên Google Docs</span>
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Nút xem hướng dẫn tạo Google Docs -->
          <button onclick="window.appAuth.openDocsGuideModal(1); window.appAuth.closeProfileModal();" 
            class="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-200 dark:border-blue-800/80 text-[#4255FF] dark:text-[#7383FF] text-xs font-bold flex items-center justify-between transition-all">
            <span class="flex items-center gap-2">
              <span class="text-base">📋</span>
              <span>Hướng dẫn tạo Google Docs cá nhân (1-Click Copy)</span>
            </span>
            <span>&rarr;</span>
          </button>
        </div>

        <!-- Các Nút Hành Động -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E8EF] dark:border-[#282E4E]">
          <button onclick="window.appAuth.openLoginModal(); window.appAuth.closeProfileModal();" 
            class="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#252945] hover:bg-slate-200 dark:hover:bg-[#2e3458] text-[#2E3856] dark:text-white text-xs font-bold transition-all text-center">
            Đổi tài khoản khác
          </button>
          <button onclick="window.appAuth.logout()" 
            class="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-all text-center">
            Đăng xuất
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  closeProfileModal() {
    const modal = document.getElementById('modal-auth-profile');
    if (modal) modal.classList.add('hidden');
  }

  openAvatarPicker() {
    if (!this.currentUser) {
      this.openLoginModal();
      return;
    }

    let modal = document.getElementById('modal-avatar-picker');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-avatar-picker';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200';
      document.body.appendChild(modal);
    }

    const emojis = ['🎓', '🚀', '🦊', '🦉', '🐱', '🎧', '⚡', '💎', '🦁', '🌸', '☕', '🌟', '🏆', '🎯', '📚', '🍀'];
    const currentAvatar = this.currentUser.avatar || '';

    modal.innerHTML = `
      <div class="w-full max-w-md bg-white dark:bg-[#1A1D36] rounded-3xl border border-[#E5E8EF] dark:border-[#282E4E] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <!-- Nút đóng -->
        <button onclick="window.appAuth.closeAvatarPicker()" class="absolute top-5 right-5 p-2 rounded-xl text-[#586380] dark:text-[#939BB4] hover:bg-slate-100 dark:hover:bg-[#252945] transition-colors" title="Đóng">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <!-- Tiêu đề -->
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-[#252945] border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-xl shadow-xs">
            🎨
          </div>
          <div>
            <h3 class="text-base font-black text-[#2E3856] dark:text-white">Đổi Ảnh Đại Diện (Avatar)</h3>
            <p class="text-xs text-[#586380] dark:text-[#939BB4]">Tải ảnh từ điện thoại, chọn icon hoặc dán link</p>
          </div>
        </div>

        <!-- 1. Tải ảnh từ thiết bị / camera điện thoại -->
        <div class="p-4 bg-slate-50 dark:bg-[#0A092D] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] mb-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-2">
            1. Tải ảnh từ điện thoại / máy tính
          </label>
          <input type="file" id="input-avatar-file" accept="image/*" class="hidden" onchange="window.appAuth.handleAvatarFileUpload(event)">
          <button type="button" onclick="document.getElementById('input-avatar-file').click()" 
            class="w-full py-3 px-4 bg-white dark:bg-[#1A1D36] hover:bg-blue-50/50 dark:hover:bg-[#252945] text-[#4255FF] dark:text-[#7383FF] border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Chọn ảnh từ Thư viện ảnh / Chụp ảnh</span>
          </button>
          <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 text-center">
            * Ảnh tự động cắt vuông 1:1 siêu nhẹ (~5KB)
          </p>
        </div>

        <!-- 2. Bộ sưu tập biểu tượng cá tính -->
        <div class="mb-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-2">
            2. Hoặc chọn biểu tượng Avatar nhanh
          </label>
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
            ${emojis.map(e => `
              <button type="button" onclick="window.appAuth.setCustomAvatar('${e}')" 
                class="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0A092D] hover:bg-blue-100 dark:hover:bg-[#252945] border ${currentAvatar === e ? 'border-[#4255FF] ring-2 ring-[#4255FF]/30' : 'border-[#E5E8EF] dark:border-[#282E4E]'} flex items-center justify-center text-xl transition-all active:scale-90"
                title="Chọn ${e}">
                ${e}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 3. Dán link ảnh trực tuyến (Tự động co vuông 1:1 siêu nét) -->
        <div class="p-3.5 bg-slate-50 dark:bg-[#0A092D] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] mb-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-1.5 flex items-center justify-between">
            <span>3. Hoặc dán link ảnh bất kỳ trên mạng</span>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold lowercase">tự động co vuông 1:1</span>
          </label>
          <div class="flex items-center gap-2">
            <input type="url" id="input-avatar-url" onkeydown="if(event.key==='Enter') window.appAuth.handleAvatarUrlSubmit()" placeholder="https://example.com/avatar.jpg" 
              class="flex-1 px-3 py-2 bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] rounded-xl text-xs font-medium text-[#2E3856] dark:text-white focus:outline-none focus:border-[#4255FF]">
            <button id="btn-submit-avatar-url" type="button" onclick="window.appAuth.handleAvatarUrlSubmit()" 
              class="px-3.5 py-2 bg-[#4255FF] hover:bg-[#3644D9] text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm">
              <span>Co & Dùng</span>
            </button>
          </div>
          <div id="avatar-url-status" class="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            * Hệ thống tự động co nhỏ ảnh về chuẩn vuông 1:1 siêu nét (~5KB) và lưu vĩnh viễn
          </div>
        </div>

        <!-- 4. Nút khôi phục mặc định -->
        <div class="pt-2 border-t border-[#E5E8EF] dark:border-[#282E4E] flex items-center justify-between">
          <button type="button" onclick="window.appAuth.setCustomAvatar('')" 
            class="text-xs font-semibold text-rose-500 hover:underline">
            ↺ Đặt lại chữ cái ban đầu
          </button>
          <button type="button" onclick="window.appAuth.closeAvatarPicker()" 
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] text-[#2E3856] dark:text-white rounded-xl text-xs font-bold active:scale-95 transition-all">
            Đóng
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  closeAvatarPicker() {
    const modal = document.getElementById('modal-avatar-picker');
    if (modal) modal.classList.add('hidden');
  }

  /**
   * Tự động cắt vuông 1:1 và nén ảnh xuống 128x128 siêu nét (~5-8KB)
   */
  cropAndCompressImage(src, isDataUrl = false) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!isDataUrl) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');

          // Cắt vuông từ tâm ảnh (Center square crop)
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 128, 128);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Không thể tải hình ảnh'));
      img.src = src;
    });
  }

  /**
   * Xử lý khi người dùng dán link ảnh từ mạng: Tự động co nhỏ và lưu bền vững
   */
  async handleAvatarUrlSubmit() {
    const input = document.getElementById('input-avatar-url');
    const btn = document.getElementById('btn-submit-avatar-url');
    const statusEl = document.getElementById('avatar-url-status');
    const rawUrl = input ? input.value.trim() : '';

    if (!rawUrl) {
      if (statusEl) {
        statusEl.innerHTML = '<span class="text-rose-500 font-semibold">⚠️ Vui lòng dán đường dẫn ảnh!</span>';
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Đang co ảnh...</span>';
    }
    if (statusEl) {
      statusEl.innerHTML = '<span class="text-[#4255FF] dark:text-[#7383FF] font-semibold flex items-center gap-1.5"><span class="w-3 h-3 border-2 border-[#4255FF] border-t-transparent rounded-full animate-spin"></span><span>Đang tải và tự động co nhỏ ảnh về chuẩn vuông 1:1...</span></span>';
    }

    let processedDataUrl = null;

    // 1. Thử tải trực tiếp với CORS anonymous để co ảnh vào canvas
    try {
      processedDataUrl = await this.cropAndCompressImage(rawUrl, false);
    } catch (directErr) {
      // 2. Nếu server chặn CORS trực tiếp, thử qua proxy để tải ảnh và co ảnh vào canvas
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(rawUrl)}`
      ];

      for (const proxy of proxies) {
        try {
          processedDataUrl = await this.cropAndCompressImage(proxy, false);
          if (processedDataUrl) break;
        } catch (pErr) {}
      }
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Co & Dùng</span>';
    }

    if (processedDataUrl) {
      // Đã co ảnh thành công thành base64 JPEG 128x128 siêu nhẹ (~5KB)
      this.setCustomAvatar(processedDataUrl);
      if (window.appRouter && typeof window.appRouter.showToast === 'function') {
        window.appRouter.showToast('✨ Đã tự động co ảnh về chuẩn vuông 1:1 siêu nét!', 'success');
      }
    } else {
      // Nếu các proxy đều không thể vẽ lên canvas, kiểm tra xem link có mở được không
      const sanitized = this.sanitizeAvatarUrl(rawUrl);
      if (sanitized) {
        this.setCustomAvatar(sanitized);
        if (window.appRouter && typeof window.appRouter.showToast === 'function') {
          window.appRouter.showToast('Đã lưu đường dẫn ảnh trực tuyến!', 'info');
        }
      } else {
        if (statusEl) {
          statusEl.innerHTML = '<span class="text-rose-500 font-semibold">❌ Không thể tải ảnh này từ mạng. Vui lòng kiểm tra lại link hoặc tải ảnh về máy rồi chọn tải lên!</span>';
        }
      }
    }
  }

  setCustomAvatar(avatarValue) {
    if (!this.currentUser) return;
    let cleanVal = (avatarValue || '').trim();

    if (cleanVal.startsWith('http://') || cleanVal.startsWith('https://') || cleanVal.startsWith('data:image')) {
      cleanVal = this.sanitizeAvatarUrl(cleanVal);
      if (!cleanVal) {
        if (window.appRouter && typeof window.appRouter.showToast === 'function') {
          window.appRouter.showToast('Đường dẫn ảnh không an toàn hoặc không hợp lệ!', 'error');
        }
        return;
      }
    } else {
      // Emoji hoặc text: Lọc sạch thẻ HTML và giới hạn độ dài
      cleanVal = cleanVal.replace(/<[^>]*>/g, '').trim().slice(0, 10);
    }

    this.currentUser.avatar = cleanVal;

    // Cập nhật trong danh sách accounts
    const idx = this.accounts.findIndex(a => a.email.toLowerCase() === this.currentUser.email.toLowerCase());
    if (idx !== -1) {
      this.accounts[idx].avatar = cleanVal;
    }
    this.saveAccounts();

    // Cập nhật trong appStorage currentUser
    if (window.appStorage) {
      window.appStorage.currentUser = this.currentUser;
      try {
        localStorage.setItem('docvocab_current_user', JSON.stringify(this.currentUser));
      } catch (e) {}
    }

    this.closeAvatarPicker();
    this.renderHeaderAuth();
    this.renderSettingsAccountCard();
    this.openProfileModal();

    if (window.appRouter && typeof window.appRouter.showToast === 'function') {
      window.appRouter.showToast('✨ Đã cập nhật ảnh đại diện thành công!', 'success');
    }
  }

  handleAvatarFileUpload(event) {
    const file = event.target && event.target.files ? event.target.files[0] : null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ!');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = await this.cropAndCompressImage(e.target.result, true);
        this.setCustomAvatar(dataUrl);
      } catch (err) {
        alert('Không thể xử lý tệp ảnh này. Vui lòng chọn ảnh khác!');
      }
    };
    reader.onerror = () => {
      alert('Lỗi đọc tệp ảnh từ thiết bị!');
    };
    reader.readAsDataURL(file);
  }

  openDocsGuideModal(activeStep = 1) {
    const settings = window.appStorage ? window.appStorage.settings : {};
    let modal = document.getElementById('modal-docs-guide');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-docs-guide';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200 overflow-y-auto';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-white dark:bg-[#1A1D36] rounded-3xl border border-[#E5E8EF] dark:border-[#282E4E] shadow-2xl p-5 sm:p-7 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <!-- Nút đóng -->
        <button onclick="window.appAuth.closeDocsGuideModal()" class="absolute top-5 right-5 p-2 rounded-xl text-[#586380] dark:text-[#939BB4] hover:bg-slate-100 dark:hover:bg-[#252945] transition-colors" title="Đóng">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <!-- Tiêu đề -->
        <div class="mb-5">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[#4255FF] dark:text-[#7383FF] text-xs font-extrabold uppercase tracking-wider mb-2">
            <span>Dành cho người dùng mới</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-[#2E3856] dark:text-white">
            Hướng Dẫn Tạo Kho Google Docs Riêng
          </h2>
          <p class="text-xs sm:text-sm text-[#586380] dark:text-[#939BB4] mt-1 leading-relaxed">
            Chỉ với 3 bước đơn giản dưới đây, bạn sẽ sở hữu file Google Docs tự động hóa 2 chiều: Thêm từ trên web sẽ tự ghi vào Docs, và sửa trên Docs sẽ tự cập nhật vào web!
          </p>
        </div>

        <!-- Stepper Navigation -->
        <div class="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-[#0A092D] rounded-2xl mb-6 text-xs font-bold select-none">
          <button id="guide-tab-btn-1" onclick="window.appAuth.switchGuideStep(1)" class="guide-step-btn py-2 px-2 rounded-xl text-center transition-all ${activeStep === 1 ? 'bg-white dark:bg-[#1A1D36] text-[#4255FF] shadow-sm font-extrabold' : 'text-[#586380] dark:text-[#939BB4]'}">
            Bước 1: Tạo bản sao Doc
          </button>
          <button id="guide-tab-btn-2" onclick="window.appAuth.switchGuideStep(2)" class="guide-step-btn py-2 px-2 rounded-xl text-center transition-all ${activeStep === 2 ? 'bg-white dark:bg-[#1A1D36] text-[#4255FF] shadow-sm font-extrabold' : 'text-[#586380] dark:text-[#939BB4]'}">
            Bước 2: Cài Apps Script
          </button>
          <button id="guide-tab-btn-3" onclick="window.appAuth.switchGuideStep(3)" class="guide-step-btn py-2 px-2 rounded-xl text-center transition-all ${activeStep === 3 ? 'bg-white dark:bg-[#1A1D36] text-[#4255FF] shadow-sm font-extrabold' : 'text-[#586380] dark:text-[#939BB4]'}">
            Bước 3: Dán link vào Web
          </button>
        </div>

        <!-- NỘI DUNG TỪNG BƯỚC -->
        <div id="guide-step-content-container">
          <!-- BƯỚC 1 -->
          <div id="guide-step-1" class="guide-step-panel ${activeStep === 1 ? '' : 'hidden'} space-y-4">
            <div class="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
              <h4 class="font-bold text-sm text-[#4255FF] flex items-center gap-2 mb-1.5">
                <span>1. Tạo tài liệu Google Docs cá nhân từ mẫu chuẩn</span>
              </h4>
              <p class="text-xs text-[#2E3856] dark:text-slate-300 leading-relaxed mb-3">
                Bạn không cần mất thời gian kẻ bảng hay căn lề. Hãy nhấn nút bên dưới để Google Docs tự động tạo bản sao mẫu chuẩn 5 cột (ID, Từ vựng, Loại từ, Nghĩa, Ví dụ) vào Google Drive của bạn:
              </p>
              
              <div class="flex flex-col sm:flex-row gap-2.5">
                <a href="https://docs.google.com/document/d/1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4/copy" target="_blank" 
                  class="flex-1 py-3 px-4 bg-[#4255FF] hover:bg-[#3644D9] text-white rounded-xl text-xs font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-center">
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  <span>📋 Tạo bản sao Google Docs vào Drive của tôi</span>
                </a>
                
                <a href="https://docs.google.com/document/d/1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4/export?format=docx" target="_blank" 
                  class="py-3 px-3 bg-slate-100 dark:bg-[#252945] hover:bg-slate-200 dark:hover:bg-[#2e3458] text-[#2E3856] dark:text-white rounded-xl text-xs font-semibold active:scale-98 transition-all flex items-center justify-center gap-1.5" title="Tải file .docx mẫu về máy tính">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Tải file .docx</span>
                </a>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A092D] border border-[#E5E8EF] dark:border-[#282E4E] text-xs text-[#586380] dark:text-[#939BB4]">
              <strong class="text-[#2E3856] dark:text-white">Cấu trúc bảng chuẩn:</strong>
              <div class="mt-2 grid grid-cols-5 gap-1 text-[11px] font-mono text-center font-bold">
                <span class="p-1 rounded bg-slate-200 dark:bg-[#252945]">1. ID</span>
                <span class="p-1 rounded bg-slate-200 dark:bg-[#252945]">2. Word</span>
                <span class="p-1 rounded bg-slate-200 dark:bg-[#252945]">3. POS</span>
                <span class="p-1 rounded bg-slate-200 dark:bg-[#252945]">4. Meaning</span>
                <span class="p-1 rounded bg-slate-200 dark:bg-[#252945]">5. Notes</span>
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button onclick="window.appAuth.switchGuideStep(2)" class="px-5 py-2.5 bg-[#4255FF] text-white font-bold rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1.5">
                <span>Tiếp tục Bước 2</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <!-- BƯỚC 2 -->
          <div id="guide-step-2" class="guide-step-panel ${activeStep === 2 ? '' : 'hidden'} space-y-4">
            <div class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
              <h4 class="font-bold text-sm text-[#4255FF] flex items-center gap-2 mb-2">
                <span>2. Cài đặt Apps Script để tự động cập nhật 2 chiều</span>
              </h4>
              <p class="text-xs text-[#2E3856] dark:text-slate-300 leading-relaxed mb-3">
                Trong file Google Docs vừa tạo ở Bước 1, thực hiện 4 bước sau:
              </p>
              
              <ol class="text-xs text-[#2E3856] dark:text-slate-300 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                <li>Bấm menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; chọn <strong>Apps Script</strong>.</li>
                <li>Xóa toàn bộ mã cũ trong trình soạn thảo, rồi nhấn nút <strong>Sao chép mã</strong> bên dưới và dán vào. Nhấn <strong>Ctrl + S</strong> để lưu.</li>
                <li>Nhấn nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải &gt; chọn <strong>Tùy chọn triển khai mới (New deployment)</strong>.</li>
                <li>Bấm vào biểu tượng bánh răng bên cạnh <em>Chọn loại (Select type)</em> &gt; chọn <strong>Ứng dụng web (Web app)</strong>.</li>
                <li>Mục <em>Ai có quyền truy cập (Who has access)</em>: chọn <strong>Bất kỳ ai (Anyone)</strong> &gt; Nhấn <strong>Triển khai</strong>.</li>
              </ol>

              <div class="mt-4 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/40">
                <button id="btn-copy-code-gs" onclick="window.appAuth.copyAppsScriptCode()" 
                  class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span id="btn-copy-code-text">📋 Sao chép mã Google Apps Script (Code.gs)</span>
                </button>
              </div>
            </div>

            <div class="flex justify-between pt-2">
              <button onclick="window.appAuth.switchGuideStep(1)" class="px-4 py-2 bg-slate-100 dark:bg-[#252945] text-[#2E3856] dark:text-white font-bold rounded-xl text-xs active:scale-95 transition-all">
                &larr; Quay lại Bước 1
              </button>
              <button onclick="window.appAuth.switchGuideStep(3)" class="px-5 py-2.5 bg-[#4255FF] text-white font-bold rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1.5">
                <span>Tiếp tục Bước 3</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <!-- BƯỚC 3 -->
          <div id="guide-step-3" class="guide-step-panel ${activeStep === 3 ? '' : 'hidden'} space-y-4">
            <div class="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <h4 class="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                <span>3. Dán URL Web App vào DocVocab để kết nối</span>
              </h4>
              <p class="text-xs text-[#2E3856] dark:text-slate-300 leading-relaxed mb-3">
                Sau khi triển khai thành công, Google Apps Script sẽ cung cấp một đường link Web App kết thúc bằng <code class="font-mono text-[11px] bg-emerald-100 dark:bg-emerald-950 px-1 py-0.5 rounded text-emerald-800 dark:text-emerald-300">/exec</code>. Hãy dán vào ô dưới đây:
              </p>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-1">
                    URL Google Apps Script Web App
                  </label>
                  <input id="guide-input-script-url" type="url" placeholder="https://script.google.com/macros/s/.../exec" 
                    value="${settings.scriptUrl || ''}"
                    class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0A092D] border border-[#E5E8EF] dark:border-[#282E4E] rounded-xl text-xs font-mono focus:outline-none focus:border-[#4255FF] text-[#2E3856] dark:text-white" />
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-1">
                    Google Doc ID (Dự phòng)
                  </label>
                  <input id="guide-input-doc-id" type="text" placeholder="1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4" 
                    value="${settings.docId || ''}"
                    class="w-full px-3.5 py-2.5 bg-white dark:bg-[#0A092D] border border-[#E5E8EF] dark:border-[#282E4E] rounded-xl text-xs font-mono focus:outline-none focus:border-[#4255FF] text-[#2E3856] dark:text-white" />
                </div>

                <button onclick="window.appAuth.saveGuideConfig()" 
                  class="w-full py-3 bg-[#4255FF] hover:bg-[#3644D9] text-white font-bold rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Hoàn tất & Kết nối kho cá nhân ngay</span>
                </button>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2">
              <button onclick="window.appAuth.switchGuideStep(2)" class="px-4 py-2 bg-slate-100 dark:bg-[#252945] text-[#2E3856] dark:text-white font-bold rounded-xl text-xs active:scale-95 transition-all">
                &larr; Quay lại Bước 2
              </button>
              <button onclick="window.appAuth.closeDocsGuideModal()" class="text-xs text-[#586380] dark:text-[#939BB4] hover:underline">
                Để sau (Dùng kho 158 từ có sẵn)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  closeDocsGuideModal() {
    const modal = document.getElementById('modal-docs-guide');
    if (modal) modal.classList.add('hidden');
  }

  switchGuideStep(stepNum) {
    for (let i = 1; i <= 3; i++) {
      const panel = document.getElementById(`guide-step-${i}`);
      const btn = document.getElementById(`guide-tab-btn-${i}`);
      if (panel) {
        if (i === stepNum) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
      if (btn) {
        if (i === stepNum) {
          btn.className = 'guide-step-btn py-2 px-2 rounded-xl text-center transition-all bg-white dark:bg-[#1A1D36] text-[#4255FF] shadow-sm font-extrabold';
        } else {
          btn.className = 'guide-step-btn py-2 px-2 rounded-xl text-center transition-all text-[#586380] dark:text-[#939BB4] font-bold';
        }
      }
    }
  }

  copyAppsScriptCode() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE).then(() => {
        const textEl = document.getElementById('btn-copy-code-text');
        if (textEl) {
          textEl.innerText = '✅ Đã sao chép toàn bộ mã vào bộ nhớ tạm!';
          setTimeout(() => {
            textEl.innerText = '📋 Sao chép mã Google Apps Script (Code.gs)';
          }, 3500);
        }
        if (window.appRouter && typeof window.appRouter.showToast === 'function') {
          window.appRouter.showToast('Đã sao chép mã Apps Script. Giờ bạn dán vào Google Docs nhé!', 'success');
        }
      }).catch(err => {
        alert('Lỗi sao chép: ' + err);
      });
    } else {
      alert('Trình duyệt không hỗ trợ tự động sao chép. Bạn có thể mở file google-apps-script/Code.gs để lấy mã.');
    }
  }

  saveGuideConfig() {
    const scriptInput = document.getElementById('guide-input-script-url');
    const docIdInput = document.getElementById('guide-input-doc-id');

    const scriptUrl = scriptInput ? scriptInput.value.trim() : '';
    const docId = docIdInput ? docIdInput.value.trim() : '';

    if (!scriptUrl && !docId) {
      alert('Vui lòng nhập ít nhất URL Apps Script hoặc Google Doc ID!');
      return;
    }

    const newSettings = {};
    if (scriptUrl) newSettings.scriptUrl = scriptUrl;
    if (docId) newSettings.docId = docId;

    window.appStorage.saveSettings(newSettings);

    if (this.currentUser) {
      if (scriptUrl) this.currentUser.scriptUrl = scriptUrl;
      if (docId) this.currentUser.docId = docId;
      const acc = this.accounts.find(a => a.email.toLowerCase() === this.currentUser.email.toLowerCase());
      if (acc) {
        if (scriptUrl) acc.scriptUrl = scriptUrl;
        if (docId) acc.docId = docId;
        this.saveAccounts();
      }
    }

    this.closeDocsGuideModal();

    if (window.appRouter && typeof window.appRouter.showToast === 'function') {
      window.appRouter.showToast('Đã lưu cấu hình Google Docs cho tài khoản của bạn! Đang đồng bộ...', 'success');
    }

    // Tiến hành đồng bộ ngay
    setTimeout(() => {
      window.appSync.sync();
    }, 500);
  }
}

window.appAuth = new AuthManager();
