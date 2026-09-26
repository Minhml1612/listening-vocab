/**
 * GOOGLE DOCS SYNC ENGINE (v3.0 - Bulletproof)
 * Đồng bộ hóa thời gian thực từ Google Docs không bao giờ tạo từ rỗng hay lỗi lặp
 */

class DocSyncEngine {
  constructor() {
    this.isSyncing = false;
    this.timer = null;
    this.initAutoSync();
  }

  initAutoSync() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const settings = window.appStorage.settings;
        if (settings.autoSync && settings.scriptUrl) {
          this.sync({ silent: true });
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

  async sync(options = {}) {
    if (this.isSyncing) return { status: 'already_syncing' };
    this.isSyncing = true;
    window.dispatchEvent(new CustomEvent('sync:started'));

    const settings = window.appStorage.settings;
    let parsedWords = [];
    let sourceUsed = '';

    try {
      // 1. Thử qua Google Apps Script Web App
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

      // 2. Thử qua Public Export link
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
              if (text && !text.includes('accounts.google.com') && text.length > 50) {
                parsedWords = this.parseRawText(text);
                sourceUsed = 'Google Docs Export';
                break;
              }
            }
          } catch (proxyErr) {}
        }
      }

      if (parsedWords.length === 0) {
        this.isSyncing = false;
        const errMessage = 'Không thể kết nối tới Google Docs. Đã giữ nguyên danh sách chuẩn hiện tại.';
        window.dispatchEvent(new CustomEvent('sync:error', { detail: { message: errMessage, silent: !!options.silent } }));
        return { status: 'error', message: errMessage };
      }

      // Lưu các từ vào storage (sanitizer sẽ tự lọc sạch)
      const result = window.appStorage.addOrUpdateWords(parsedWords);

      this.isSyncing = false;
      const syncResult = {
        status: 'success',
        source: sourceUsed,
        addedCount: result.addedCount,
        updatedCount: result.updatedCount,
        total: result.total,
        silent: !!options.silent
      };

      window.dispatchEvent(new CustomEvent('sync:success', { detail: syncResult }));
      return syncResult;

    } catch (err) {
      this.isSyncing = false;
      window.dispatchEvent(new CustomEvent('sync:error', { detail: { message: err.toString(), silent: !!options.silent } }));
      return { status: 'error', message: err.toString() };
    }
  }

  parseDocumentData(data) {
    if (Array.isArray(data.tableRows) && data.tableRows.length > 0) {
      const words = [];
      data.tableRows.forEach(row => {
        if (!row || row.length === 0) return;
        const first = (row[0] || '').trim();
        if (['word', 'từ', 'từ vựng', 'stt'].includes(first.toLowerCase())) return;

        let word = first;
        let pos = '';
        let meaning = '';

        if (row.length >= 3) {
          pos = (row[1] || '').trim();
          meaning = (row[2] || '').trim();
        } else {
          meaning = (row[1] || '').trim();
        }

        if (word && word.length >= 2) {
          words.push({
            word: word,
            partOfSpeech: pos,
            meaning: meaning || 'thuộc bài listening',
            isNew: false
          });
        }
      });
      if (words.length > 0) return words;
    }

    const rawText = data.rawText || (data.lines ? data.lines.join('\n') : '');
    return this.parseRawText(rawText);
  }

  parseRawText(text) {
    if (!text) return [];
    const lines = text.split(/\r?\n/);
    const words = [];
    const seen = new Set();

    const SPECIAL_MAPPINGS = {
      'empty': { word: 'empty', pos: 'adj', meaning: 'trống rỗng, không có gì bên trong (thời gian dài)' },
      'in stock': { word: 'in stock', pos: 'phrase', meaning: 'trạng thái còn hàng trong kho' },
      'get in touch': { word: 'get in touch', pos: 'phrase', meaning: 'liên hệ, liên lạc với ai đó' },
      'be the key to': { word: 'be the key to', pos: 'phrase', meaning: 'là chìa khóa / yếu tố then chốt dẫn đến...' },
      'sports jacket': { word: 'sports jacket', pos: 'n', meaning: 'áo khoác thể thao (dùng cho nhiều hoạt động)' },
      'grin from ear to ear': { word: 'grin from ear to ear', pos: 'idiom', meaning: 'cười toe toét tới tận mang tai' },
      'massive': { word: 'massive', pos: 'adj', meaning: 'to lớn, khổng lồ (tương đương big)' },
      'sorrow': { word: 'sorrow', pos: 'n', meaning: 'nỗi buồn, sự đau lòng' },
      'get acquainted': { word: 'get acquainted', pos: 'phrase', meaning: 'làm quen, tìm hiểu và thích nghi với điều gì' }
    };

    for (let rawLine of lines) {
      let line = rawLine.trim();
      if (!line) continue;
      if (line.toLowerCase().includes('tài liệu từ vựng')) continue;

      let body = line.replace(/^\s*\d+[\.\)]\s*/, '').trim();
      if (!body) continue;

      // Bỏ qua ghi chú phụ
      if (body.startsWith('blank là trống rỗng') || body.includes('→ a + adjective + sort of person')) {
        continue;
      }

      let word = '', pos = '', meaning = '';

      if (body.startsWith('còn empty là')) {
        word = 'empty'; pos = 'adj'; meaning = 'trống rỗng (kiểu siêu trống rỗng lâu rồi)';
      } else if (body.includes('In stock là')) {
        word = 'in stock'; pos = 'phrase'; meaning = 'trạng thái còn hàng trong kho';
      } else if (body.includes('is the key to')) {
        word = 'be the key to'; pos = 'phrase'; meaning = 'là chìa khóa, yếu tố then chốt dẫn đến...';
      } else if (body.includes('Sports jacket')) {
        word = 'sports jacket'; pos = 'n'; meaning = 'áo khoác thể thao đa năng';
      } else if (body.includes('Massive == big')) {
        word = 'massive'; pos = 'adj'; meaning = 'to lớn, khổng lồ (bằng big)';
      } else if (body.includes('You should get in touch')) {
        word = 'get in touch'; pos = 'phrase'; meaning = 'liên hệ, liên lạc';
      } else if (body.includes('grinning from ear to ear')) {
        word = 'grin from ear to ear'; pos = 'idiom'; meaning = 'cười toe toét tới tận mang tai';
      } else if (body.startsWith('Sorrow (n)')) {
        word = 'sorrow'; pos = 'n'; meaning = 'nỗi buồn, sự đau lòng';
      } else {
        const delimiters = [':', ';', ' - ', ' == ', ' = ', ' – ', ' — ', ' là '];
        let foundDelim = null;
        for (const d of delimiters) {
          if (body.includes(d)) {
            foundDelim = d;
            break;
          }
        }

        let rawW = '';
        if (foundDelim) {
          const parts = body.split(foundDelim);
          rawW = (parts[0] || '').trim();
          meaning = parts.slice(1).join(foundDelim).trim();
        } else {
          const mInline = body.match(/^(.*?)\s*\((n|v|a|adj|adv|prep|cụm.*?|collocation)\)\s+(.*)$/i);
          if (mInline) {
            rawW = mInline[1].trim();
            pos = mInline[2].trim();
            meaning = mInline[3].trim();
          } else {
            rawW = body.trim();
            meaning = '';
          }
        }

        if (!pos) {
          const mPos = rawW.match(/\((.*?)\)/);
          if (mPos) {
            pos = mPos[1].trim();
            rawW = rawW.replace(/\(.*?\)/, '').trim();
          }
        }

        word = rawW.trim();
      }

      word = word.replace(/^[^\w\s]+/, '').replace(/[^\w\s\-\']+$/, '').trim();
      if (!word || word.length < 2) continue;

      const key = word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      if (!meaning || meaning === 'Đang cập nhật' || meaning === 'Đang cập nhật...') {
        if (SPECIAL_MAPPINGS[key]) {
          meaning = SPECIAL_MAPPINGS[key].meaning;
          pos = SPECIAL_MAPPINGS[key].pos;
        } else {
          meaning = 'thuộc bài listening';
        }
      }

      words.push({
        id: 'w-' + (words.length + 1),
        word: word,
        phonetic: '',
        partOfSpeech: pos,
        meaning: meaning,
        definition: '',
        example: `The speaker used the word "${word}" in the listening conversation.`,
        exampleVi: `Người nói đã dùng từ "${word}" trong đoạn hội thoại bài nghe.`,
        audioUrl: '',
        isNew: false,
        isStarred: false,
        isMastered: false,
        quizCount: 0,
        correctCount: 0,
        dateAdded: Date.now(),
        tags: ['listening', 'google-doc']
      });
    }

    return words;
  }
}

window.appSync = new DocSyncEngine();
