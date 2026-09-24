/**
 * STORAGE & STATE MANAGER
 * Quản lý lưu trữ từ vựng, cài đặt, tiến trình học trong LocalStorage
 */

const STORAGE_KEYS = {
  WORDS: 'docvocab_words_v1',
  SETTINGS: 'docvocab_settings_v1',
  STATS: 'docvocab_stats_v1',
  HISTORY: 'docvocab_sync_history_v1'
};

const DEFAULT_SETTINGS = {
  scriptUrl: '',
  docId: '1n9VKp_QEw3ZdIyQCdkU75co8GhAZm1GY',
  autoSync: true,
  autoSyncInterval: 10, // phút
  geminiApiKey: '',
  speechAccent: 'en-US',
  speechRate: 0.95,
  theme: 'light',
  soundEffects: true,
  autoSpeakOnFlip: true,
  hapticFeedback: true
};

// Từ vựng mẫu chất lượng cao cho Listening để trải nghiệm ngay
const SAMPLE_WORDS = [
  {
    id: 'sample-1',
    word: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    meaning: 'kiên cường, có khả năng phục hồi nhanh chóng',
    definition: 'able to withstand or recover quickly from difficult conditions',
    example: 'Local communities have proved remarkably resilient in the face of natural disasters.',
    exampleVi: 'Cộng đồng địa phương đã chứng tỏ sự kiên cường đáng nể khi đối mặt với thiên tai.',
    audioUrl: '',
    isNew: true,
    isStarred: false,
    isMastered: false,
    quizCount: 0,
    correctCount: 0,
    dateAdded: Date.now() - 3600000,
    tags: ['listening', 'ielts']
  },
  {
    id: 'sample-2',
    word: 'elaborate',
    phonetic: '/ɪˈlæb.ər.ət/',
    partOfSpeech: 'verb / adjective',
    meaning: 'giải thích chi tiết, tỉ mỉ, công phu',
    definition: 'involving many carefully arranged parts or details; develop in detail',
    example: 'Could you elaborate on the main findings of your recent research?',
    exampleVi: 'Bạn có thể giải thích chi tiết hơn về các phát hiện chính trong nghiên cứu gần đây không?',
    audioUrl: '',
    isNew: true,
    isStarred: true,
    isMastered: false,
    quizCount: 0,
    correctCount: 0,
    dateAdded: Date.now() - 7200000,
    tags: ['listening', 'academic']
  },
  {
    id: 'sample-3',
    word: 'fluctuate',
    phonetic: '/ˈflʌk.tʃu.eɪt/',
    partOfSpeech: 'verb',
    meaning: 'dao động, biến động liên tục',
    definition: 'rise and fall irregularly in number or amount',
    example: 'Temperatures fluctuate widely between day and night in the desert.',
    exampleVi: 'Nhiệt độ dao động rất lớn giữa ngày và đêm ở vùng sa mạc.',
    audioUrl: '',
    isNew: false,
    isStarred: false,
    isMastered: false,
    quizCount: 1,
    correctCount: 1,
    dateAdded: Date.now() - 86400000,
    tags: ['listening', 'trends']
  },
  {
    id: 'sample-4',
    word: 'unprecedented',
    phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
    partOfSpeech: 'adjective',
    meaning: 'chưa từng có tiền lệ, chưa từng thấy',
    definition: 'never done or known before; extraordinary',
    example: 'The city is experiencing an unprecedented surge in tourism this summer.',
    exampleVi: 'Thành phố đang trải qua một đợt tăng trưởng du lịch chưa từng có trong mùa hè này.',
    audioUrl: '',
    isNew: false,
    isStarred: true,
    isMastered: true,
    quizCount: 3,
    correctCount: 3,
    dateAdded: Date.now() - 172800000,
    tags: ['listening', 'news']
  },
  {
    id: 'sample-5',
    word: 'ambiguous',
    phonetic: '/æmˈbɪɡ.ju.əs/',
    partOfSpeech: 'adjective',
    meaning: 'mơ hồ, nhập nhằng, có nhiều hơn một nghĩa',
    definition: 'open to more than one interpretation; having a double meaning',
    example: 'The instructions in the listening section were somewhat ambiguous.',
    exampleVi: 'Các hướng dẫn trong phần nghe có phần hơi mơ hồ.',
    audioUrl: '',
    isNew: false,
    isStarred: false,
    isMastered: false,
    quizCount: 2,
    correctCount: 1,
    dateAdded: Date.now() - 259200000,
    tags: ['listening', 'vocabulary']
  }
];

class StorageManager {
  constructor() {
    this.words = this.loadWords();
    this.settings = this.loadSettings();
    this.stats = this.loadStats();
    this.fetchRemoteData();
  }

  async fetchRemoteData() {
    try {
      const resp = await fetch('data/vocab.json', { cache: 'no-cache' });
      if (resp.ok) {
        const remoteWords = await resp.json();
        if (Array.isArray(remoteWords) && remoteWords.length > 0) {
          this.addOrUpdateWords(remoteWords);
        }
      }
    } catch (e) {
      // Offline hoặc file tĩnh không khả dụng
    }
  }

  loadWords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!data) {
        this.saveWords(SAMPLE_WORDS);
        return SAMPLE_WORDS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi khi tải từ vựng:', e);
      return SAMPLE_WORDS;
    }
  }

  saveWords(words) {
    this.words = words;
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
      window.dispatchEvent(new CustomEvent('vocab:updated', { detail: words }));
    } catch (e) {
      console.error('Lỗi khi lưu từ vựng:', e);
    }
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

    // Tính streak ngày liên tiếp
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
    // Merge từ mới vào danh sách hiện tại theo word text (lowercase)
    const existingMap = new Map();
    this.words.forEach(w => existingMap.set(w.word.toLowerCase().trim(), w));

    let addedCount = 0;
    let updatedCount = 0;

    newWordsList.forEach(item => {
      const key = item.word.toLowerCase().trim();
      if (!key) return;

      if (existingMap.has(key)) {
        // Cập nhật thông tin nếu có thêm nghĩa mới
        const old = existingMap.get(key);
        existingMap.set(key, {
          ...old,
          meaning: item.meaning || old.meaning,
          definition: item.definition || old.definition,
          example: item.example || old.example,
          exampleVi: item.exampleVi || old.exampleVi,
          phonetic: item.phonetic || old.phonetic,
          partOfSpeech: item.partOfSpeech || old.partOfSpeech
        });
        updatedCount++;
      } else {
        // Thêm mới
        const newWord = {
          id: 'w-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
          word: item.word.trim(),
          phonetic: item.phonetic || '',
          partOfSpeech: item.partOfSpeech || '',
          meaning: item.meaning || 'Đang cập nhật...',
          definition: item.definition || '',
          example: item.example || '',
          exampleVi: item.exampleVi || '',
          audioUrl: item.audioUrl || '',
          isNew: true, // Đánh dấu từ mới
          isStarred: false,
          isMastered: false,
          quizCount: 0,
          correctCount: 0,
          dateAdded: Date.now(),
          tags: item.tags || ['listening']
        };
        existingMap.set(key, newWord);
        addedCount++;
      }
    });

    const merged = Array.from(existingMap.values());
    // Sắp xếp: từ mới nhất lên đầu
    merged.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));

    this.saveWords(merged);
    return { addedCount, updatedCount, total: merged.length };
  }

  deleteWord(wordId) {
    const words = this.words.filter(w => w.id !== wordId);
    this.saveWords(words);
  }
}

window.appStorage = new StorageManager();
