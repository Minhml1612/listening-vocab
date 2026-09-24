/**
 * MAIN APP CONTROLLER & ROUTER
 * Điều phối toàn bộ giao diện, định tuyến các chế độ học, tìm kiếm và quản lý từ vựng
 */

class AppRouter {
  constructor() {
    this.currentRoute = 'home';
    this.searchQuery = '';
    this.activeFilter = 'all'; // all | new | learning | mastered | starred
    this.init();
  }

  init() {
    this.applyTheme(window.appStorage.settings.theme);
    this.setupEventListeners();
    this.navigate('home');

    // Tự động kiểm tra đồng bộ khi vừa khởi chạy app nếu đã cấu hình
    setTimeout(() => {
      const settings = window.appStorage.settings;
      if (settings.autoSync && settings.scriptUrl) {
        window.appSync.sync({ silent: true });
      }
    }, 1500);
  }

  setupEventListeners() {
    // Lắng nghe sự kiện đồng bộ
    window.addEventListener('sync:started', () => {
      this.updateSyncBadge(true);
    });

    window.addEventListener('sync:success', (e) => {
      this.updateSyncBadge(false);
      const detail = e.detail;
      if (detail.addedCount > 0) {
        this.showToast(`🎉 Đã cập nhật ${detail.addedCount} từ vựng mới từ Google Docs!`, 'success');
      } else {
        this.showToast(`✅ Đã đồng bộ tài liệu mới nhất (${detail.total} từ)`, 'info');
      }
      if (this.currentRoute === 'home') {
        this.renderWordList();
      }
    });

    window.addEventListener('sync:error', (e) => {
      this.updateSyncBadge(false);
      this.showToast(e.detail.message || 'Lỗi khi đồng bộ Google Docs', 'error');
    });

    window.addEventListener('vocab:updated', () => {
      if (this.currentRoute === 'home') {
        this.renderWordList();
      }
      this.updateStatsBar();
    });
  }

  navigate(route) {
    this.currentRoute = route;

    // Cập nhật trạng thái active trên thanh bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.route === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Ẩn/hiện container
    const homeView = document.getElementById('view-home');
    const modeView = document.getElementById('view-mode');
    const settingsView = document.getElementById('view-settings');
    const modeTitle = document.getElementById('mode-header-title');

    homeView.classList.add('hidden');
    modeView.classList.add('hidden');
    settingsView.classList.add('hidden');

    const words = window.appStorage.words;

    switch (route) {
      case 'home':
        homeView.classList.remove('hidden');
        this.renderWordList();
        this.updateStatsBar();
        break;

      case 'flashcard':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Thẻ ghi nhớ (Flashcard)';
        window.flashcardCtrl.init(this.getFilteredStudyWords());
        break;

      case 'quiz':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Trắc nghiệm & Ngữ cảnh';
        window.quizCtrl.init(this.getFilteredStudyWords(), 10);
        break;

      case 'match':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Ghép thẻ siêu tốc';
        window.matchCtrl.init(this.getFilteredStudyWords());
        break;

      case 'listening':
        modeView.classList.remove('hidden');
        if (modeTitle) modeTitle.innerText = 'Luyện nghe & Chính tả';
        window.listeningCtrl.init(this.getFilteredStudyWords());
        break;

      case 'settings':
        settingsView.classList.remove('hidden');
        this.renderSettings();
        break;
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getFilteredStudyWords() {
    let pool = [...window.appStorage.words];
    if (this.activeFilter === 'new') {
      pool = pool.filter(w => w.isNew);
    } else if (this.activeFilter === 'starred') {
      pool = pool.filter(w => w.isStarred);
    } else if (this.activeFilter === 'learning') {
      pool = pool.filter(w => !w.isMastered);
    }
    // Nếu bộ lọc làm rỗng, fallback về toàn bộ danh sách
    return pool.length > 0 ? pool : window.appStorage.words;
  }

  updateStatsBar() {
    const words = window.appStorage.words;
    const total = words.length;
    const mastered = words.filter(w => w.isMastered).length;
    const learning = total - mastered;
    const newCount = words.filter(w => w.isNew).length;

    const elTotal = document.getElementById('stat-total-words');
    const elMastered = document.getElementById('stat-mastered-words');
    const elLearning = document.getElementById('stat-learning-words');
    const elNew = document.getElementById('stat-new-words');

    if (elTotal) elTotal.innerText = total;
    if (elMastered) elMastered.innerText = mastered;
    if (elLearning) elLearning.innerText = learning;
    if (elNew) {
      elNew.innerText = newCount;
      elNew.parentElement.classList.toggle('hidden', newCount === 0);
    }
  }

  setFilter(filter) {
    this.activeFilter = filter;
    const filterButtons = document.querySelectorAll('.filter-chip');
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('bg-indigo-600', 'text-white');
        btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      } else {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      }
    });
    this.renderWordList();
  }

  handleSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderWordList();
  }

  renderWordList() {
    const listContainer = document.getElementById('word-list-items');
    if (!listContainer) return;

    // Chỉ lấy các từ hợp lệ (không rỗng)
    let words = window.appStorage.words.filter(w => w && w.word && w.word.trim().length >= 2);

    // Áp dụng bộ lọc
    if (this.activeFilter === 'new') {
      words = words.filter(w => w.isNew);
    } else if (this.activeFilter === 'learning') {
      words = words.filter(w => !w.isMastered);
    } else if (this.activeFilter === 'mastered') {
      words = words.filter(w => w.isMastered);
    } else if (this.activeFilter === 'starred') {
      words = words.filter(w => w.isStarred);
    }

    // Áp dụng tìm kiếm
    if (this.searchQuery) {
      words = words.filter(w => 
        w.word.toLowerCase().includes(this.searchQuery) ||
        (w.meaning && w.meaning.toLowerCase().includes(this.searchQuery)) ||
        (w.definition && w.definition.toLowerCase().includes(this.searchQuery))
      );
    }

    const countBadge = document.getElementById('word-count-badge');
    if (countBadge) countBadge.innerText = `${words.length} từ`;

    if (words.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <p class="text-sm font-semibold text-slate-500">Không tìm thấy từ vựng nào phù hợp.</p>
          <button onclick="window.appRouter.setFilter('all'); document.getElementById('search-input').value = ''; window.appRouter.handleSearch('')" class="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Xoá bộ lọc tìm kiếm
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = words.map((w, idx) => `
      <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow transition-all group">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono font-bold text-slate-400">#${idx + 1}</span>
              <span class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">${w.word}</span>
              ${w.phonetic ? `<span class="text-xs font-mono text-indigo-600 dark:text-indigo-400">${w.phonetic}</span>` : ''}
              ${w.isNew ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 badge-pulse">MỚI</span>` : ''}
              ${w.partOfSpeech ? `<span class="text-[11px] text-slate-400 font-medium">(${w.partOfSpeech})</span>` : ''}
            </div>

            <p class="text-sm text-slate-700 dark:text-slate-200 mt-1 font-medium">${w.meaning}</p>
            
            ${w.example ? `
              <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
                <p class="italic">"${w.example}"</p>
                ${w.exampleVi ? `<p class="text-slate-400 dark:text-slate-500 mt-0.5">${w.exampleVi}</p>` : ''}
              </div>
            ` : ''}
          </div>

          <div class="flex items-center gap-1">
            <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { audioUrl: '${w.audioUrl || ''}' })" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg" title="Phát âm">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
            <button onclick="window.appStorage.toggleStar('${w.id}')" class="p-2 ${w.isStarred ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'} rounded-lg" title="Đánh dấu">
              <i data-lucide="star" class="w-4 h-4 ${w.isStarred ? 'fill-amber-500' : ''}"></i>
            </button>
            <button onclick="window.appRouter.showWordOptions('${w.id}')" class="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
              <i data-lucide="more-vertical" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  resetAllData() {
    if (confirm('Khôi phục danh sách từ vựng sạch chuẩn từ Google Docs?')) {
      const count = window.appStorage.resetToCleanDefault();
      this.showToast(`✅ Đã làm sạch và khôi phục ${count} từ vựng chuẩn!`, 'success');
      this.renderWordList();
      this.updateStatsBar();
    }
  }

  clearAllNew() {
    window.appStorage.clearAllNewBadges();
    this.showToast('✅ Đã đánh dấu tất cả từ vựng là từ cũ đã xem!', 'info');
    this.renderWordList();
    this.updateStatsBar();
  }

  showWordOptions(wordId) {
    const word = window.appStorage.words.find(w => w.id === wordId);
    if (!word) return;

    if (confirm(`Bạn có muốn xóa từ "${word.word}" khỏi danh sách học không?`)) {
      window.appStorage.deleteWord(wordId);
      this.showToast(`Đã xóa từ "${word.word}"`, 'info');
      this.renderWordList();
    }
  }

  renderSettings() {
    const s = window.appStorage.settings;
    const inputScript = document.getElementById('setting-script-url');
    const inputDocId = document.getElementById('setting-doc-id');
    const inputInterval = document.getElementById('setting-sync-interval');
    const toggleAutoSync = document.getElementById('setting-auto-sync');
    const inputApiKey = document.getElementById('setting-gemini-key');
    const selectAccent = document.getElementById('setting-accent');
    const selectTheme = document.getElementById('setting-theme');

    if (inputScript) inputScript.value = s.scriptUrl || '';
    if (inputDocId) inputDocId.value = s.docId || '';
    if (inputInterval) inputInterval.value = s.autoSyncInterval || 10;
    if (toggleAutoSync) toggleAutoSync.checked = s.autoSync !== false;
    if (inputApiKey) inputApiKey.value = s.geminiApiKey || '';
    if (selectAccent) selectAccent.value = s.speechAccent || 'en-US';
    if (selectTheme) selectTheme.value = s.theme || 'light';
  }

  saveSettingsFromForm() {
    const inputScript = document.getElementById('setting-script-url');
    const inputDocId = document.getElementById('setting-doc-id');
    const inputInterval = document.getElementById('setting-sync-interval');
    const toggleAutoSync = document.getElementById('setting-auto-sync');
    const inputApiKey = document.getElementById('setting-gemini-key');
    const selectAccent = document.getElementById('setting-accent');
    const selectTheme = document.getElementById('setting-theme');

    const newSettings = {
      scriptUrl: inputScript ? inputScript.value.trim() : '',
      docId: inputDocId ? inputDocId.value.trim() : '',
      autoSyncInterval: inputInterval ? parseInt(inputInterval.value) || 10 : 10,
      autoSync: toggleAutoSync ? toggleAutoSync.checked : true,
      geminiApiKey: inputApiKey ? inputApiKey.value.trim() : '',
      speechAccent: selectAccent ? selectAccent.value : 'en-US',
      theme: selectTheme ? selectTheme.value : 'light'
    };

    window.appStorage.saveSettings(newSettings);
    this.applyTheme(newSettings.theme);
    window.appSync.startPeriodicSync();
    this.showToast('✅ Đã lưu cài đặt thành công!', 'success');
  }

  applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }

  updateSyncBadge(isSyncing) {
    const syncBtn = document.getElementById('btn-header-sync');
    const syncIcon = document.getElementById('sync-icon');
    if (syncIcon) {
      if (isSyncing) {
        syncIcon.classList.add('animate-spin');
      } else {
        syncIcon.classList.remove('animate-spin');
      }
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colorClasses = type === 'success' 
      ? 'bg-emerald-600 text-white' 
      : type === 'error' 
      ? 'bg-rose-600 text-white' 
      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900';

    toast.className = `p-3.5 px-4 rounded-xl shadow-lg text-xs md:text-sm font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${colorClasses}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info'}" class="w-4 h-4 flex-shrink-0"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  openAddWordModal() {
    const modal = document.getElementById('modal-add-word');
    if (modal) modal.classList.remove('hidden');
  }

  closeAddWordModal() {
    const modal = document.getElementById('modal-add-word');
    if (modal) modal.classList.add('hidden');
  }

  async handleAddWordForm(e) {
    e.preventDefault();
    const wordInput = document.getElementById('add-word-input');
    const meaningInput = document.getElementById('add-meaning-input');
    const exampleInput = document.getElementById('add-example-input');

    const word = wordInput ? wordInput.value.trim() : '';
    if (!word) return;

    const meaning = meaningInput ? meaningInput.value.trim() : '';
    const example = exampleInput ? exampleInput.value.trim() : '';

    this.closeAddWordModal();
    this.showToast(`Đang thêm và tra cứu tự động cho "${word}"...`, 'info');

    // Thêm vào storage
    window.appStorage.addOrUpdateWords([{
      word,
      meaning: meaning || 'Đang cập nhật...',
      example: example || ''
    }]);

    // Làm giàu tự động qua AI / từ điển
    const enriched = await window.appEnricher.enrich({ word, meaning, example }, window.appStorage.settings.geminiApiKey);
    const updated = window.appStorage.words.map(w => w.word.toLowerCase() === word.toLowerCase() ? { ...w, ...enriched } : w);
    window.appStorage.saveWords(updated);

    this.showToast(`✨ Đã thêm thành công từ "${word}"!`, 'success');

    if (wordInput) wordInput.value = '';
    if (meaningInput) meaningInput.value = '';
    if (exampleInput) exampleInput.value = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
});
