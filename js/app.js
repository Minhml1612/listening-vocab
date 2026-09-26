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
        btn.classList.add('bg-[#D97757]', 'text-white', 'border-[#D97757]');
        btn.classList.remove('bg-white', 'dark:bg-[#1E1C1A]', 'text-[#736D64]', 'dark:text-[#9E968D]');
      } else {
        btn.classList.remove('bg-[#D97757]', 'text-white', 'border-[#D97757]');
        btn.classList.add('bg-white', 'dark:bg-[#1E1C1A]', 'text-[#736D64]', 'dark:text-[#9E968D]');
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
        <div class="text-center py-12 px-4 bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#E6E1D8] dark:border-[#332E2A]">
          <p class="text-xs md:text-sm font-mono text-[#736D64] dark:text-[#9E968D]">Không tìm thấy từ vựng nào phù hợp.</p>
          <button onclick="window.appRouter.setFilter('all'); document.getElementById('search-input').value = ''; window.appRouter.handleSearch('')" class="mt-2 text-xs font-mono text-[#D97757] font-semibold hover:underline">
            $ reset-filter
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = words.map((w, idx) => `
      <div class="p-3.5 md:p-4 bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#E6E1D8] dark:border-[#332E2A] hover:border-[#D97757]/60 dark:hover:border-[#D97757]/60 shadow-sm transition-all group">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono text-[#736D64] dark:text-[#9E968D]">#${String(idx + 1).padStart(3, '0')}</span>
              <span class="text-base md:text-lg font-bold text-[#1E1D1B] dark:text-[#EDE8E3] tracking-tight font-sans">${w.word}</span>
              ${w.phonetic ? `<span class="text-xs font-mono text-[#D97757] font-semibold">${w.phonetic}</span>` : ''}
              ${w.isNew ? `<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">NEW</span>` : ''}
              ${w.partOfSpeech ? `<span class="text-[11px] font-mono text-[#736D64] dark:text-[#9E968D]">(${w.partOfSpeech})</span>` : ''}
            </div>

            <p class="text-sm text-[#1E1D1B] dark:text-[#EDE8E3] mt-1 font-medium font-sans">${w.meaning}</p>
            
            ${w.example ? `
              <div class="mt-2.5 pt-2 border-t border-[#E6E1D8]/60 dark:border-[#292522]">
                <div class="pl-2.5 border-l-2 border-[#D97757]">
                  <p class="text-xs md:text-sm text-[#1E1D1B] dark:text-[#EDE8E3] font-normal leading-relaxed">"${w.example}"</p>
                  ${w.exampleVi ? `<p class="text-[11px] text-[#736D64] dark:text-[#9E968D] mt-0.5 italic">${w.exampleVi}</p>` : ''}
                </div>
                <div class="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[#736D64] dark:text-[#9E968D]">
                  <span>📖 ${w.dictSource || "Oxford Learner's Dictionary"}</span>
                  <a href="https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent((w.word || '').toLowerCase().trim().replace(/\s+/g, '-'))}" target="_blank" rel="noopener noreferrer" class="text-[#D97757] hover:underline font-semibold inline-flex items-center gap-0.5">
                    Oxford ↗
                  </a>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="flex items-center gap-0.5">
            <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { audioUrl: '${w.audioUrl || ''}' })" class="p-2 text-[#736D64] dark:text-[#9E968D] hover:text-[#D97757] hover:bg-[#D97757]/10 rounded-lg transition-colors" title="Phát âm">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
            <button onclick="window.appStorage.toggleStar('${w.id}')" class="p-2 ${w.isStarred ? 'text-[#F59E0B]' : 'text-[#736D64] dark:text-[#6E675F] hover:text-[#F59E0B]'} rounded-lg transition-colors" title="Đánh dấu">
              <i data-lucide="star" class="w-4 h-4 ${w.isStarred ? 'fill-[#F59E0B]' : ''}"></i>
            </button>
            <button onclick="window.appRouter.showWordOptions('${w.id}')" class="p-2 text-[#736D64] dark:text-[#6E675F] hover:text-[#1E1D1B] dark:hover:text-[#EDE8E3] rounded-lg transition-colors">
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
    const isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    window.appStorage.saveSettings({ theme: newTheme });
    this.applyTheme(newTheme);
    this.showToast(newTheme === 'dark' ? '🌙 Chế độ Claude Obsidian (Dark)' : '☀️ Chế độ Claude Parchment (Light)', 'info');
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
      ? 'bg-[#1E1C1A] text-[#EDE8E3] border border-[#10B981]/50' 
      : type === 'error' 
      ? 'bg-[#1E1C1A] text-[#EDE8E3] border border-[#EF4444]/50' 
      : 'bg-[#1E1C1A] text-[#EDE8E3] border border-[#332E2A]';

    const iconColor = type === 'success' ? 'text-[#10B981]' : type === 'error' ? 'text-[#EF4444]' : 'text-[#D97757]';

    toast.className = `p-3 px-4 rounded-xl shadow-2xl text-xs md:text-sm font-mono flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${colorClasses}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'terminal'}" class="w-4 h-4 flex-shrink-0 ${iconColor}"></i>
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
