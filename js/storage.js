/**
 * STORAGE & STATE MANAGER (v3.0 - Auto-Sanitized)
 * Quản lý lưu trữ từ vựng, cài đặt, tiến trình học trong LocalStorage
 */

const STORAGE_KEYS = {
  WORDS: 'docvocab_words_v10', // v10: 159 mục từ chuẩn hóa Google Docs & từ điển Oxford trực tiếp
  SETTINGS: 'docvocab_settings_v1',
  STATS: 'docvocab_stats_v1',
  HISTORY: 'docvocab_sync_history_v1'
};

const DEFAULT_SETTINGS = {
  scriptUrl: '',
  docId: '1fEDLcsNSUEAyS_lczHTDs5mT9Z24_6nMrHeu3ypPgZ4',
  autoSync: true,
  autoSyncInterval: 10,
  geminiApiKey: '',
  speechAccent: 'en-US',
  speechRate: 0.95,
  theme: 'dark',
  soundEffects: true,
  autoSpeakOnFlip: true,
  hapticFeedback: true
};

const SAMPLE_WORDS = [
  {
    id: 'sample-1',
    word: 'Pour',
    phonetic: '/pɔː(r)/',
    partOfSpeech: 'verb',
    meaning: 'đổ thứ gì đó',
    definition: 'to make a liquid or other substance flow from a container in a continuous stream by holding the container at an angle',
    example: 'Could you please pour some more hot water into the teapot?',
    exampleVi: 'Bạn có thể vui lòng rót thêm nước nóng vào ấm trà được không?',
    oxfordExamples: [
      { en: 'Could you please pour some more hot water into the teapot?', vi: 'Bạn có thể vui lòng rót thêm nước nóng vào ấm trà được không?' },
      { en: 'Tears were pouring down his face as he waved goodbye.', vi: 'Nước mắt giàn giụa tuôn rơi trên má anh ấy khi vẫy tay chào tạm biệt.' }
    ],
    collocations: ['pour sth into/from/out of sth', 'pour somebody a drink', 'pour down with rain'],
    dictSource: "Oxford Advanced Learner's Dictionary (OALD)",
    audioUrl: '',
    isNew: false,
    isStarred: false,
    isMastered: false,
    quizCount: 0,
    correctCount: 0,
    dateAdded: Date.now()
  }
];

class StorageManager {
  constructor() {
    this.words = this.loadWords();
    this.settings = this.loadSettings();
    this.stats = this.loadStats();
    this.fetchRemoteData();
  }

  sanitizeList(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const clean = [];

    for (const w of list) {
      if (!w || typeof w !== 'object') continue;
      const wordText = (w.word || '').trim();
      // Bỏ qua các từ rỗng, dấu gạch hoặc quá ngắn
      if (!wordText || wordText.length < 2) continue;

      const key = wordText.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      let meaningText = (w.meaning || '').trim();
      if (!meaningText || meaningText.includes('cập nhật')) {
        meaningText = 'thuộc bài listening tự học';
      }

      clean.push({
        id: w.id || ('w-' + (clean.length + 1)),
        docId: w.docId || '',
        word: wordText,
        phonetic: w.phonetic || '',
        partOfSpeech: w.partOfSpeech || '',
        meaning: meaningText,
        notes: w.notes || w.usageNote || '',
        definition: w.definition || '',
        example: w.example || `The speaker used the word "${wordText}" in the listening conversation.`,
        exampleVi: w.exampleVi || `Người nói đã dùng từ "${wordText}" trong bài nghe.`,
        oxfordExamples: Array.isArray(w.oxfordExamples) ? w.oxfordExamples : [],
        collocations: Array.isArray(w.collocations) ? w.collocations : [],
        dictSource: w.dictSource || "Oxford Advanced Learner's Dictionary (OALD)",
        gapSentence: w.gapSentence || '',
        quizAnswer: w.quizAnswer || '',
        distractors: Array.isArray(w.distractors) ? w.distractors : [],
        audioUrl: w.audioUrl || '',
        isNew: false,
        isStarred: !!w.isStarred,
        isMastered: !!w.isMastered,
        quizCount: w.quizCount || 0,
        correctCount: w.correctCount || 0,
        dateAdded: w.dateAdded || Date.now(),
        tags: w.tags || ['listening']
      });
    }

    return clean;
  }

  async fetchRemoteData() {
    try {
      const resp = await fetch('data/vocab.json?v=' + Date.now(), { cache: 'no-cache' });
      if (resp.ok) {
        const remoteWords = await resp.json();
        if (Array.isArray(remoteWords) && remoteWords.length >= 100) {
          const cleanRemote = this.sanitizeList(remoteWords);
          // Cập nhật lại toàn bộ kho từ nếu máy đang bị lưu thiếu hoặc chưa có câu ví dụ Oxford
          const needsUpdate = this.words.length !== cleanRemote.length || 
                              this.words.some(w => !w.word || !w.definition || !w.phonetic);
          if (needsUpdate) {
            const currentStats = {};
            this.words.forEach(w => {
              if (w && w.word) {
                currentStats[w.word.toLowerCase().trim()] = {
                  isStarred: !!w.isStarred,
                  isMastered: !!w.isMastered,
                  quizCount: w.quizCount || 0,
                  correctCount: w.correctCount || 0
                };
              }
            });
            const updatedList = cleanRemote.map(item => {
              const key = (item.word || '').toLowerCase().trim();
              const prev = currentStats[key] || {};
              return {
                ...item,
                isStarred: prev.isStarred !== undefined ? prev.isStarred : !!item.isStarred,
                isMastered: prev.isMastered !== undefined ? prev.isMastered : !!item.isMastered,
                quizCount: prev.quizCount !== undefined ? prev.quizCount : (item.quizCount || 0),
                correctCount: prev.correctCount !== undefined ? prev.correctCount : (item.correctCount || 0)
              };
            });
            this.saveWords(updatedList);
          }
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }

  loadWords() {
    try {
      const defaultData = (window.DEFAULT_VOCAB_DATA && window.DEFAULT_VOCAB_DATA.length >= 100)
        ? window.DEFAULT_VOCAB_DATA 
        : SAMPLE_WORDS;

      const raw = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!raw) {
        // Chuyển giao tiến trình từ v8/v7/v6/v5 sang v10
        let statsMap = {};
        const prevRaw = localStorage.getItem('docvocab_words_v8') || localStorage.getItem('docvocab_words_v7') || localStorage.getItem('docvocab_words_v6') || localStorage.getItem('docvocab_words_v5') || localStorage.getItem('docvocab_words_v4');
        if (prevRaw) {
          try {
            const prevList = JSON.parse(prevRaw);
            if (Array.isArray(prevList)) {
              prevList.forEach(item => {
                if (item && item.word) {
                  statsMap[item.word.toLowerCase().trim()] = {
                    isStarred: !!item.isStarred,
                    isMastered: !!item.isMastered,
                    quizCount: item.quizCount || 0,
                    correctCount: item.correctCount || 0
                  };
                }
              });
            }
          } catch (e) {}
        }

        const mergedList = defaultData.map(item => {
          const key = (item.word || '').toLowerCase().trim();
          const prev = statsMap[key] || {};
          return {
            ...item,
            isStarred: prev.isStarred !== undefined ? prev.isStarred : !!item.isStarred,
            isMastered: prev.isMastered !== undefined ? prev.isMastered : !!item.isMastered,
            quizCount: prev.quizCount !== undefined ? prev.quizCount : (item.quizCount || 0),
            correctCount: prev.correctCount !== undefined ? prev.correctCount : (item.correctCount || 0)
          };
        });

        const sanitizedDefault = this.sanitizeList(mergedList);
        this.saveWords(sanitizedDefault);
        return sanitizedDefault;
      }

      let parsed = JSON.parse(raw);
      parsed = this.sanitizeList(parsed);

      // Nếu dữ liệu bị thiếu trường định nghĩa Oxford hoặc số lượng không khớp, đồng bộ với defaultData
      const isMissingOxford = parsed.some(w => !w.definition || !w.phonetic);
      if (isMissingOxford || parsed.length < 50 || parsed.length > 180) {
        const statsMap = {};
        parsed.forEach(w => {
          if (w && w.word) {
            statsMap[w.word.toLowerCase().trim()] = {
              isStarred: !!w.isStarred,
              isMastered: !!w.isMastered,
              quizCount: w.quizCount || 0,
              correctCount: w.correctCount || 0
            };
          }
        });
        const upgraded = defaultData.map(item => {
          const key = (item.word || '').toLowerCase().trim();
          const prev = statsMap[key] || {};
          return {
            ...item,
            isStarred: prev.isStarred !== undefined ? prev.isStarred : !!item.isStarred,
            isMastered: prev.isMastered !== undefined ? prev.isMastered : !!item.isMastered,
            quizCount: prev.quizCount !== undefined ? prev.quizCount : (item.quizCount || 0),
            correctCount: prev.correctCount !== undefined ? prev.correctCount : (item.correctCount || 0)
          };
        });
        const clean = this.sanitizeList(upgraded);
        this.saveWords(clean);
        return clean;
      }

      return parsed;
    } catch (e) {
      console.error('Lỗi khi tải từ vựng:', e);
      return this.sanitizeList(window.DEFAULT_VOCAB_DATA || SAMPLE_WORDS);
    }
  }

  saveWords(words) {
    this.words = this.sanitizeList(words);
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(this.words));
      window.dispatchEvent(new CustomEvent('vocab:updated', { detail: this.words }));
    } catch (e) {
      console.error('Lỗi khi lưu từ vựng:', e);
    }
  }

  resetToCleanDefault() {
    const defaultData = (window.DEFAULT_VOCAB_DATA && window.DEFAULT_VOCAB_DATA.length >= 100)
      ? window.DEFAULT_VOCAB_DATA 
      : SAMPLE_WORDS;
    const clean = this.sanitizeList(defaultData);
    this.saveWords(clean);
    return clean.length;
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return { ...DEFAULT_SETTINGS };
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      // Tự động nâng cấp Doc ID sang tài liệu chuẩn hóa mới nếu còn lưu ID cũ
      if (parsed.docId === '1n9VKp_QEw3ZdIyQCdkU75co8GhAZm1GY') {
        parsed.docId = DEFAULT_SETTINGS.docId;
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        } catch (e) {}
      }
      return parsed;
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      window.dispatchEvent(new CustomEvent('settings:updated', { detail: this.settings }));
    } catch (e) {
      console.error('Lỗi lưu cài đặt:', e);
    }
  }

  loadStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        return {
          totalReviews: 0,
          streakDays: 1,
          lastStudyDate: new Date().toDateString(),
          accuracyRate: 100
        };
      }
      return JSON.parse(data);
    } catch (e) {
      return { totalReviews: 0, streakDays: 1, lastStudyDate: new Date().toDateString(), accuracyRate: 100 };
    }
  }

  saveStats(stats) {
    this.stats = stats;
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Lỗi lưu thống kê:', e);
    }
  }

  recordStudySession(correct, total) {
    const today = new Date().toDateString();
    const stats = this.stats;
    stats.totalReviews += total;

    const lastDate = new Date(stats.lastStudyDate);
    const currDate = new Date(today);
    const diffTime = currDate - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      stats.streakDays += 1;
    } else if (diffDays > 1) {
      stats.streakDays = 1;
    }
    stats.lastStudyDate = today;
    this.saveStats(stats);
  }

  toggleStar(wordId) {
    const words = this.words.map(w => {
      if (w.id === wordId) {
        return { ...w, isStarred: !w.isStarred };
      }
      return w;
    });
    this.saveWords(words);
  }

  toggleMastered(wordId, masteredStatus) {
    const words = this.words.map(w => {
      if (w.id === wordId) {
        const status = typeof masteredStatus === 'boolean' ? masteredStatus : !w.isMastered;
        return { ...w, isMastered: status, lastReviewed: Date.now() };
      }
      return w;
    });
    this.saveWords(words);
  }

  recordWordResult(wordId, isCorrect) {
    const words = this.words.map(w => {
      if (w.id === wordId) {
        const quizCount = (w.quizCount || 0) + 1;
        const correctCount = (w.correctCount || 0) + (isCorrect ? 1 : 0);
        const isMastered = (correctCount >= 3 && (correctCount / quizCount) >= 0.7);
        return {
          ...w,
          quizCount,
          correctCount,
          isMastered,
          lastReviewed: Date.now()
        };
      }
      return w;
    });
    this.saveWords(words);
  }

  clearNewBadge(wordId) {
    const words = this.words.map(w => {
      if (w.id === wordId) {
        return { ...w, isNew: false };
      }
      return w;
    });
    this.saveWords(words);
  }

  clearAllNewBadges() {
    const words = this.words.map(w => ({ ...w, isNew: false }));
    this.saveWords(words);
  }

  addOrUpdateWords(newWordsList) {
    const existingMap = new Map();
    this.words.forEach(w => {
      if (w && w.word && w.word.trim().length >= 2) {
        existingMap.set(w.word.toLowerCase().trim(), w);
      }
    });

    let addedCount = 0;
    let updatedCount = 0;

    newWordsList.forEach(item => {
      if (!item || !item.word) return;
      const cleanWord = item.word.trim();
      if (cleanWord.length < 2) return;
      const key = cleanWord.toLowerCase();

      if (existingMap.has(key)) {
        const old = existingMap.get(key);
        existingMap.set(key, {
          ...old,
          meaning: (item.meaning && !item.meaning.includes('cập nhật')) ? item.meaning : old.meaning,
          definition: item.definition || old.definition,
          example: item.example || old.example,
          exampleVi: item.exampleVi || old.exampleVi,
          phonetic: item.phonetic || old.phonetic,
          partOfSpeech: item.partOfSpeech || old.partOfSpeech
        });
        updatedCount++;
      } else {
        const newWord = {
          id: item.id || ('w-' + (existingMap.size + 1)),
          word: cleanWord,
          phonetic: item.phonetic || '',
          partOfSpeech: item.partOfSpeech || '',
          meaning: (item.meaning && !item.meaning.includes('cập nhật')) ? item.meaning : 'thuộc bài listening',
          definition: item.definition || '',
          example: item.example || `The speaker used the word "${cleanWord}" in the listening conversation.`,
          exampleVi: item.exampleVi || `Người nói đã dùng từ "${cleanWord}" trong bài nghe.`,
          audioUrl: item.audioUrl || '',
          isNew: false,
          isStarred: false,
          isMastered: false,
          quizCount: 0,
          correctCount: 0,
          dateAdded: item.dateAdded || Date.now(),
          tags: item.tags || ['listening']
        };
        existingMap.set(key, newWord);
        addedCount++;
      }
    });

    const merged = this.sanitizeList(Array.from(existingMap.values()));
    this.saveWords(merged);
    return { addedCount, updatedCount, total: merged.length };
  }

  deleteWord(wordId) {
    const words = this.words.filter(w => w.id !== wordId);
    this.saveWords(words);
  }
}

window.appStorage = new StorageManager();
