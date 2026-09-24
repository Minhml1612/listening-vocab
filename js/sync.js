/**
 * GOOGLE DOCS SYNC ENGINE
 * Đồng bộ hóa thời gian thực từ tài liệu Google Docs
 */

class DocSyncEngine {
  constructor() {
    this.isSyncing = false;
    this.timer = null;
    this.initAutoSync();
  }

  initAutoSync() {
    // Tự động kiểm tra đồng bộ khi người dùng mở lại tab trên điện thoại
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const settings = window.appStorage.settings;
        if (settings.autoSync && settings.scriptUrl) {
          this.sync();
        }
      }
    });

    this.startPeriodicSync();
  }

  startPeriodicSync() {
    if (this.timer) clearInterval(this.timer);
    const settings = window.appStorage.settings;
    if (settings.autoSync && settings.autoSyncInterval > 0) {
      const ms = Math.max(1, settings.autoSyncInterval) * 60 * 1000;
      this.timer = setInterval(() => {
        this.sync({ silent: true });
      }, ms);
    }
  }

  /**
   * Đồng bộ dữ liệu từ Google Docs
   */
  async sync(options = {}) {
    if (this.isSyncing) return { status: 'already_syncing' };
    this.isSyncing = true;
    window.dispatchEvent(new CustomEvent('sync:started'));

    const settings = window.appStorage.settings;
    let parsedWords = [];
    let sourceUsed = '';

    try {
      // 1. Thử qua Google Apps Script Web App (Phương án khuyên dùng số 1)
      if (settings.scriptUrl && settings.scriptUrl.trim().startsWith('http')) {
        try {
          const resp = await fetch(settings.scriptUrl.trim(), { cache: 'no-store' });
          if (resp.ok) {
            const data = await resp.json();
            if (data.status === 'success' || data.rawText || data.lines) {
              parsedWords = this.parseDocumentData(data);
              sourceUsed = 'Google Apps Script (Thời gian thực)';
            }
          }
        } catch (scriptErr) {
          console.warn('Apps Script fetch failed:', scriptErr);
        }
      }

      // 2. Nếu chưa có kết quả và có docId, thử phương án Public Export qua CORS Proxy
      if (parsedWords.length === 0 && settings.docId) {
        const docId = settings.docId.trim();
        const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
        const proxies = [
          `https://corsproxy.io/?url=${encodeURIComponent(exportUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(exportUrl)}`
        ];

        for (const proxy of proxies) {
          try {
            const resp = await fetch(proxy, { cache: 'no-store' });
            if (resp.ok) {
              const text = await resp.text();
              // Đảm bảo không phải trang chuyển hướng đăng nhập Google
              if (text && !text.includes('accounts.google.com') && text.length > 5) {
                parsedWords = this.parseRawText(text);
                sourceUsed = 'Google Docs Public Export';
                break;
              }
            }
          } catch (proxyErr) {
            // Thử proxy kế tiếp
          }
        }
      }

      if (parsedWords.length === 0) {
        this.isSyncing = false;
        const errMessage = settings.scriptUrl 
          ? 'Không thể tải dữ liệu từ Google Docs. Vui lòng kiểm tra lại URL Apps Script hoặc phân quyền chia sẻ tài liệu.' 
          : 'Chưa cấu hình URL Google Apps Script. Hãy vào phần Cài đặt để kết nối!';
        window.dispatchEvent(new CustomEvent('sync:error', { detail: { message: errMessage } }));
        return { status: 'error', message: errMessage };
      }

      // 3. Phân biệt từ mới và cập nhật vào kho lưu trữ
      const existingMap = new Map();
      window.appStorage.words.forEach(w => existingMap.set(w.word.toLowerCase().trim(), w));

      const newWordsToEnrich = [];
      parsedWords.forEach(w => {
        const key = w.word.toLowerCase().trim();
        if (!existingMap.has(key)) {
          newWordsToEnrich.push(w);
        }
      });

      // Lưu các từ vào storage
      const result = window.appStorage.addOrUpdateWords(parsedWords);

      // 4. Tự động làm giàu các từ MỚI trong nền (tra IPA, nghĩa, ví dụ)
      if (newWordsToEnrich.length > 0) {
        this.enrichNewWordsInBackground(newWordsToEnrich);
      }

      this.isSyncing = false;
      const syncResult = {
        status: 'success',
        source: sourceUsed,
        addedCount: result.addedCount,
        updatedCount: result.updatedCount,
        total: result.total,
        newWords: newWordsToEnrich.map(w => w.word)
      };

      window.dispatchEvent(new CustomEvent('sync:success', { detail: syncResult }));
      return syncResult;

    } catch (err) {
      this.isSyncing = false;
      window.dispatchEvent(new CustomEvent('sync:error', { detail: { message: err.toString() } }));
      return { status: 'error', message: err.toString() };
    }
  }

  /**
   * Tự động làm giàu danh sách từ mới trong nền
   */
  async enrichNewWordsInBackground(newWords) {
    const apiKey = window.appStorage.settings.geminiApiKey;
    for (const item of newWords) {
      try {
        const enriched = await window.appEnricher.enrich(item, apiKey);
        // Cập nhật lại trong kho từ
        const allWords = window.appStorage.words.map(w => {
          if (w.word.toLowerCase() === enriched.word.toLowerCase()) {
            return {
              ...w,
              ...enriched,
              isNew: true // Giữ cờ từ mới
            };
          }
          return w;
        });
        window.appStorage.saveWords(allWords);
      } catch (e) {
        console.warn('Background enrich error for word:', item.word, e);
      }
    }
  }

  /**
   * Phân tích dữ liệu JSON trả về từ Google Apps Script
   */
  parseDocumentData(data) {
    const words = [];

    // Nếu có dữ liệu từ bảng (Table Rows)
    if (Array.isArray(data.tableRows) && data.tableRows.length > 0) {
      data.tableRows.forEach(row => {
        if (!row || row.length === 0) return;
        // Bỏ qua dòng tiêu đề nếu có
        const firstCell = (row[0] || '').trim();
        if (['word', 'từ', 'từ vựng', 'vocabulary'].includes(firstCell.toLowerCase())) return;

        const word = firstCell;
        const meaning = (row[1] || '').trim();
        const example = (row[2] || '').trim();
        if (word && word.length < 50) {
          words.push(this.formatExtractedWord(word, meaning, example));
        }
      });
    }

    // Nếu không có bảng hoặc bảng rỗng, đọc theo từng dòng text
    if (words.length === 0) {
      const rawText = data.rawText || (data.lines ? data.lines.join('\n') : '');
      return this.parseRawText(rawText);
    }

    return words;
  }

  /**
   * Bộ parser thông minh đọc các định dạng text tự do trong Google Docs
   */
  parseRawText(text) {
    if (!text) return [];
    const lines = text.split(/\r?\n/);
    const words = [];

    for (let rawLine of lines) {
      let line = rawLine.trim();
      if (!line) continue;

      // Xoá ký tự bullet point, số thứ tự đầu dòng (1. 2. - * •)
      line = line.replace(/^[\d+.)\-*•\s]+/, '').trim();
      if (!line || line.length < 2) continue;

      let word = '';
      let meaning = '';
      let example = '';

      // Trường hợp: word : meaning (: example)
      // hoặc word - meaning (- example)
      // hoặc word = meaning
      // hoặc word /ipa/ : meaning
      const delimiters = [':', ' - ', ' = ', ' – ', ' — ', '\t'];
      let foundDelim = null;
      for (const d of delimiters) {
        if (line.includes(d)) {
          foundDelim = d;
          break;
        }
      }

      if (foundDelim) {
        const parts = line.split(foundDelim);
        word = (parts[0] || '').trim();
        meaning = (parts[1] || '').trim();
        example = (parts.slice(2).join(' ') || '').trim();
      } else {
        // Chỉ có mỗi từ vựng trên 1 dòng
        // Kiểm tra xem dòng đó có phải một từ hoặc cụm từ ngắn
        if (line.split(/\s+/).length <= 4 && !line.includes('.')) {
          word = line;
        }
      }

      if (word && word.length < 60 && !word.startsWith('http')) {
        words.push(this.formatExtractedWord(word, meaning, example));
      }
    }

    return words;
  }

  /**
   * Chuẩn hoá từ vựng, trích xuất từ loại (n, v, adj) nếu người dùng có ghi
   */
  formatExtractedWord(rawWord, rawMeaning, rawExample) {
    let word = rawWord.trim();
    let partOfSpeech = '';
    let phonetic = '';

    // Bóc tách phiên âm /.../ nếu người dùng tự viết trong từ
    const phoneticMatch = word.match(/\/(.*?)\//);
    if (phoneticMatch) {
      phonetic = `/${phoneticMatch[1]}/`;
      word = word.replace(/\/(.*?)\//, '').trim();
    }

    // Bóc tách từ loại (v), (n), (adj), (adv)
    const posMatch = word.match(/\((n|v|adj|adv|prep|conj|noun|verb|adjective|adverb)\)/i);
    if (posMatch) {
      partOfSpeech = posMatch[1].toLowerCase();
      word = word.replace(/\((n|v|adj|adv|prep|conj|noun|verb|adjective|adverb)\)/i, '').trim();
    }

    return {
      word: word,
      phonetic: phonetic,
      partOfSpeech: partOfSpeech,
      meaning: rawMeaning || 'Đang cập nhật...',
      definition: '',
      example: rawExample || '',
      exampleVi: '',
      tags: ['google-doc', 'listening']
    };
  }
}

window.appSync = new DocSyncEngine();
