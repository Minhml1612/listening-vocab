/**
 * STORAGE & STATE MANAGER (v3.0 - Auto-Sanitized)
 * Quản lý lưu trữ từ vựng, cài đặt, tiến trình học trong LocalStorage
 */

const STORAGE_KEYS = {
  WORDS: 'docvocab_words_v6', // v6: Tích hợp đầy đủ link tra cứu Oxford Learner's Dictionaries
  SETTINGS: 'docvocab_settings_v1',
  STATS: 'docvocab_stats_v1',
  HISTORY: 'docvocab_sync_history_v1'
};

const DEFAULT_SETTINGS = {
  scriptUrl: '',
  docId: '1n9VKp_QEw3ZdIyQCdkU75co8GhAZm1GY',
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
    phonetic: '/pɔːr/',
    partOfSpeech: 'v',
    meaning: 'đổ thứ gì đó',
    definition: 'cause to flow in a stream from a container',
    example: 'He poured the coffee into the mugs.',
    exampleVi: 'Anh ấy rót cà phê vào cốc.',
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
        word: wordText,
        phonetic: w.phonetic || '',
        partOfSpeech: w.partOfSpeech || '',
        meaning: meaningText,
        definition: w.definition || '',
        example: w.example || `The speaker used the word "${wordText}" in the listening conversation.`,
        exampleVi: w.exampleVi || `Người nói đã dùng từ "${wordText}" trong bài nghe.`,
        gapSentence: w.gapSentence || '',
        quizAnswer: w.quizAnswer || '',
        distractors: Array.isArray(w.distractors) ? w.distractors : [],
        dictSource: w.dictSource || '',
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
                              this.words.some(w => !w.word || !w.gapSentence);
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
      // Xoá dứt điểm các bản lưu cũ docvocab_words_v1, docvocab_words_v2 bị rác 270 từ
      try {
        localStorage.removeItem('docvocab_words_v1');
        localStorage.removeItem('docvocab_words_v2');
      } catch (err) {}

      const defaultData = (window.DEFAULT_VOCAB_DATA && window.DEFAULT_VOCAB_DATA.length >= 100)
        ? window.DEFAULT_VOCAB_DATA 
        : SAMPLE_WORDS;

      const raw = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!raw) {
        // Migrate tiến trình (sao, độ thành thạo) từ v3/v4/v5 sang v6 nếu có
        let statsMap = {};
        const prevRaw = localStorage.getItem('docvocab_words_v5') || localStorage.getItem('docvocab_words_v4') || localStorage.getItem('docvocab_words_v3');
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
          try {
            localStorage.removeItem('docvocab_words_v3');
            localStorage.removeItem('docvocab_words_v4');
            localStorage.removeItem('docvocab_words_v5');
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

      // Nếu dữ liệu bị bất thường (quá ít hoặc quá nhiều > 180 từ do lỗi sync cũ)
      if (parsed.length < 50 || parsed.length > 180) {
        const sanitizedDefault = this.sanitizeList(defaultData);
        this.saveWords(sanitizedDefault);
        return sanitizedDefault;
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
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
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
