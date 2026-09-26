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
        this.showToast(`🎉 Đã cập nhật ${detail.addedCount} từ mới từ Google Docs!`, 'success');
      } else if (!detail.silent) {
        this.showToast(`✅ Đã đồng bộ tài liệu (${detail.total} từ)`, 'info');
      }
      if (this.currentRoute === 'home') {
        this.renderWordList();
      }
    });

    window.addEventListener('sync:error', (e) => {
      this.updateSyncBadge(false);
      if (!e.detail?.silent) {
        this.showToast(e.detail?.message || 'Lỗi khi đồng bộ Google Docs', 'error');
      }
    });

    window.addEventListener('vocab:updated', () => {
      if (this.currentRoute === 'home') {
        this.renderWordList();
      }
      this.updateStatsBar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeOxfordModal();
        this.closeAddWordModal();
      }
    });

    const oxfordModal = document.getElementById('modal-oxford-dict');
    if (oxfordModal) {
      oxfordModal.addEventListener('click', (e) => {
        if (e.target === oxfordModal) {
          this.closeOxfordModal();
        }
      });
    }
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
        btn.classList.add('bg-[#4255FF]', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'dark:bg-[#1A1D36]', 'text-[#586380]', 'dark:text-[#939BB4]');
      } else {
        btn.classList.remove('bg-[#4255FF]', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'dark:bg-[#1A1D36]', 'text-[#586380]', 'dark:text-[#939BB4]');
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
        <div class="text-center py-12 px-4 bg-white dark:bg-[#1A1D36] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E]">
          <p class="text-sm font-medium text-[#586380] dark:text-[#939BB4]">Không tìm thấy từ vựng nào phù hợp.</p>
          <button onclick="window.appRouter.setFilter('all'); document.getElementById('search-input').value = ''; window.appRouter.handleSearch('')" class="mt-2 text-xs font-bold text-[#4255FF] hover:underline">
            Xoá bộ lọc tìm kiếm
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = words.map((w, idx) => `
      <div onclick="window.appRouter.openOxfordModal('${w.id}')" class="p-4 bg-white dark:bg-[#1A1D36] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#4255FF] shadow-sm transition-all cursor-pointer group">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold text-slate-400">#${idx + 1}</span>
              <span class="text-base md:text-lg font-bold text-[#2E3856] dark:text-white tracking-tight group-hover:text-[#4255FF] transition-colors">${w.word}</span>
              ${w.phonetic ? `<span class="text-xs font-mono text-[#4255FF] font-semibold">${w.phonetic}</span>` : ''}
              ${w.isNew ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">MỚI</span>` : ''}
              ${w.partOfSpeech ? `<span class="text-xs text-slate-400 font-medium">(${w.partOfSpeech})</span>` : ''}
            </div>

            <p class="text-sm font-semibold text-[#2E3856] dark:text-[#F6F7FB] mt-1.5">${w.meaning}</p>
            ${w.definition ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">${w.definition}</p>` : ''}
            
            ${w.example ? `
              <div class="mt-2.5 pt-2.5 border-t border-[#E5E8EF]/80 dark:border-[#282E4E] text-xs">
                <p class="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"${w.example}"</p>
                ${w.exampleVi ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${w.exampleVi}</p>` : ''}
                <div class="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span class="flex items-center gap-1.5 font-semibold text-[#002147] dark:text-indigo-300">
                    <span class="w-2 h-2 rounded-full bg-[#4255FF]"></span> ${w.dictSource || "Oxford Learner's Dictionary"}
                  </span>
                  <button type="button" onclick="event.stopPropagation(); window.appRouter.openOxfordModal('${w.id}')" class="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#4255FF] text-xs font-bold inline-flex items-center gap-1 transition-all shadow-sm">
                    <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                    <span>Tra từ Oxford</span>
                  </button>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="flex items-center gap-1" onclick="event.stopPropagation()">
            <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { audioUrl: '${w.audioUrl || ''}' })" class="p-2 text-slate-400 hover:text-[#4255FF] hover:bg-slate-50 dark:hover:bg-[#252945] rounded-xl transition-colors" title="Phát âm">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
            <button onclick="window.appStorage.toggleStar('${w.id}')" class="p-2 ${w.isStarred ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'} rounded-xl transition-colors" title="Đánh dấu">
              <i data-lucide="star" class="w-4 h-4 ${w.isStarred ? 'fill-amber-500' : ''}"></i>
            </button>
            <button onclick="window.appRouter.showWordOptions('${w.id}')" class="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors">
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
    this.showToast(newTheme === 'dark' ? '🌙 Chế độ Tối (Dark mode)' : '☀️ Chế độ Sáng (Light mode)', 'info');
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
      ? 'bg-[#23B26D] text-white shadow-emerald-500/20' 
      : type === 'error' 
      ? 'bg-[#FF725B] text-white shadow-rose-500/20' 
      : 'bg-[#2E3856] dark:bg-[#1A1D36] text-white border border-slate-700/60 shadow-xl';

    toast.className = `p-3 px-4 rounded-2xl shadow-xl text-xs md:text-sm font-semibold flex items-center gap-2.5 transform transition-all duration-300 translate-y-2 opacity-0 ${colorClasses}`;
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

  openOxfordModal(wordIdOrWord) {
    if (!wordIdOrWord) return;
    let wordItem = null;
    if (typeof wordIdOrWord === 'object') {
      wordItem = wordIdOrWord;
    } else {
      wordItem = window.appStorage.words.find(w => w.id === wordIdOrWord || w.word.toLowerCase() === String(wordIdOrWord).toLowerCase().trim());
    }

    if (!wordItem) {
      wordItem = {
        id: 'ox-' + Date.now(),
        word: String(wordIdOrWord).trim(),
        meaning: 'Đang tra cứu từ điển...',
        definition: '',
        phonetic: '',
        partOfSpeech: '',
        example: '',
        exampleVi: '',
        oxfordExamples: [],
        collocations: []
      };
    }

    const modal = document.getElementById('modal-oxford-dict');
    if (modal) {
      modal.classList.remove('hidden');
      const searchInput = document.getElementById('oxford-modal-search');
      if (searchInput) searchInput.value = wordItem.word || '';
      this.renderOxfordModalContent(wordItem);

      // Tra cứu trực tiếp nếu từ này chưa có phát âm hoặc định nghĩa
      if (!wordItem.definition || !wordItem.phonetic) {
        this.fetchLiveOxfordData(wordItem.word);
      }
    }
  }

  closeOxfordModal() {
    const modal = document.getElementById('modal-oxford-dict');
    if (modal) modal.classList.add('hidden');
  }

  async searchInOxfordModal(query) {
    const q = (query || '').trim();
    if (!q) return;
    const found = window.appStorage.words.find(w => w.word.toLowerCase() === q.toLowerCase());
    if (found) {
      this.renderOxfordModalContent(found);
    } else {
      this.openOxfordModal(q);
    }
  }

  async fetchLiveOxfordData(word) {
    try {
      const live = await window.appEnricher.fetchFreeDictionary(word);
      if (live) {
        let currentItem = window.appStorage.words.find(w => w.word.toLowerCase() === word.toLowerCase());
        if (currentItem) {
          if (!currentItem.phonetic && live.phonetic) currentItem.phonetic = live.phonetic;
          if (!currentItem.definition && live.definition) currentItem.definition = live.definition;
          if (!currentItem.partOfSpeech && live.partOfSpeech) currentItem.partOfSpeech = live.partOfSpeech;
          if (live.example && (!currentItem.oxfordExamples || currentItem.oxfordExamples.length === 0)) {
            currentItem.oxfordExamples = [{ en: live.example, vi: '' }];
          }
          window.appStorage.saveWords(window.appStorage.words);
          this.renderOxfordModalContent(currentItem);
        } else {
          const tempItem = {
            id: 'temp-' + Date.now(),
            word: word,
            meaning: live.definition ? 'Tra cứu từ điển' : 'Đang cập nhật...',
            definition: live.definition || '',
            phonetic: live.phonetic || '',
            partOfSpeech: live.partOfSpeech || '',
            example: live.example || '',
            exampleVi: '',
            oxfordExamples: live.example ? [{ en: live.example, vi: '' }] : [],
            collocations: []
          };
          this.renderOxfordModalContent(tempItem);
        }
      }
    } catch (e) {}
  }

  renderOxfordModalContent(w) {
    const body = document.getElementById('oxford-modal-body');
    if (!body) return;

    const examples = [];
    if (Array.isArray(w.oxfordExamples) && w.oxfordExamples.length > 0) {
      examples.push(...w.oxfordExamples);
    } else if (w.example) {
      examples.push({ en: w.example, vi: w.exampleVi || '' });
    }

    body.innerHTML = `
      <!-- Hero: Word & Pronunciation -->
      <div class="p-4 bg-slate-50 dark:bg-[#252945] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E]">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <h2 class="text-2xl md:text-3xl font-black text-[#2E3856] dark:text-white tracking-tight">${w.word}</h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 dark:bg-blue-950 text-[#4255FF] border border-blue-200 dark:border-blue-900/60">
                ${w.partOfSpeech || 'từ vựng'}
              </span>
            </div>
            <p class="text-xs text-[#586380] dark:text-[#939BB4] font-medium">Nguồn: ${w.dictSource || "Oxford Advanced Learner's Dictionary"}</p>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="window.appStorage.toggleStar('${w.id}'); window.appRouter.renderOxfordModalContent(window.appStorage.words.find(item => item.id === '${w.id}') || ${JSON.stringify(w).replace(/"/g, '&quot;')});" class="p-2 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] ${w.isStarred ? 'text-[#FFCD1F]' : 'text-slate-400'}" title="Đánh dấu sao">
              <i data-lucide="star" class="w-4 h-4 ${w.isStarred ? 'fill-[#FFCD1F]' : ''}"></i>
            </button>
            <button onclick="window.appStorage.toggleMastered('${w.id}'); window.appRouter.renderOxfordModalContent(window.appStorage.words.find(item => item.id === '${w.id}') || ${JSON.stringify(w).replace(/"/g, '&quot;')});" class="p-2 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] ${w.isMastered ? 'text-[#23B26D]' : 'text-slate-400'}" title="Đã thuộc">
              <i data-lucide="check-circle" class="w-4 h-4 ${w.isMastered ? 'fill-[#23B26D] text-white' : ''}"></i>
            </button>
          </div>
        </div>

        <!-- Phát âm UK & US chuẩn Oxford -->
        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { accent: 'en-GB', audioUrl: '${w.audioUrl || ''}' })" class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#4255FF] text-xs font-bold text-[#2E3856] dark:text-white inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
            <i data-lucide="volume-2" class="w-3.5 h-3.5 text-[#4255FF]"></i>
            <span class="text-[#4255FF]">UK</span>
            <span class="font-mono text-slate-500 dark:text-slate-400">${w.phonetic || ''}</span>
          </button>

          <button onclick="window.appAudio.speak('${this.escapeHtml(w.word)}', { accent: 'en-US' })" class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#23B26D] text-xs font-bold text-[#2E3856] dark:text-white inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
            <i data-lucide="volume-2" class="w-3.5 h-3.5 text-[#23B26D]"></i>
            <span class="text-[#23B26D]">US</span>
            <span class="font-mono text-slate-500 dark:text-slate-400">${w.phonetic || ''}</span>
          </button>
        </div>
      </div>

      <!-- Nghĩa Tiếng Việt -->
      <div class="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
        <div class="text-[11px] font-bold uppercase tracking-wider text-[#4255FF] mb-1">Nghĩa tiếng Việt</div>
        <p class="text-base font-bold text-[#2E3856] dark:text-white">${w.meaning}</p>
      </div>

      <!-- Định nghĩa Anh - Anh chuẩn Oxford -->
      ${w.definition ? `
        <div class="p-4 bg-slate-50 dark:bg-[#252945] border border-[#E5E8EF] dark:border-[#282E4E] rounded-2xl">
          <div class="text-[11px] font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] mb-1">Định nghĩa Oxford (English)</div>
          <p class="text-xs md:text-sm font-medium text-[#2E3856] dark:text-slate-200 leading-relaxed font-sans">${w.definition}</p>
        </div>
      ` : ''}

      <!-- Ví dụ ngữ cảnh Oxford (Context Examples) -->
      ${examples.length > 0 ? `
        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] px-1">
            Ví dụ ngữ cảnh thực tế (${examples.length} câu)
          </div>
          <div class="space-y-2">
            ${examples.map(ex => `
              <div class="p-3.5 bg-slate-50 dark:bg-[#252945] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] space-y-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-xs md:text-sm font-semibold text-[#2E3856] dark:text-white leading-relaxed">
                    "${this.highlightTargetWord(ex.en, w.word)}"
                  </p>
                  <button type="button" onclick="window.appAudio.speak('${this.escapeHtml(ex.en)}')" class="p-1.5 rounded-lg hover:bg-[#4255FF]/10 text-[#4255FF] flex-shrink-0 transition-colors" title="Nghe câu này">
                    <i data-lucide="volume-2" class="w-4 h-4"></i>
                  </button>
                </div>
                ${ex.vi ? `<p class="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 italic">${ex.vi}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Cụm từ & Cấu trúc đi kèm (Collocations) -->
      ${Array.isArray(w.collocations) && w.collocations.length > 0 ? `
        <div class="space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-[#586380] dark:text-[#939BB4] px-1">
            Cụm từ & Cấu trúc đi kèm (Oxford Collocations)
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${w.collocations.map(c => `
              <span class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#252945] text-xs font-semibold text-[#2E3856] dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                ${c}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Nút thao tác nhanh -->
      <div class="pt-2 grid grid-cols-2 gap-2">
        <button onclick="window.appRouter.closeOxfordModal(); window.appRouter.startFlashcardWithWord('${w.id}')" class="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] text-xs font-bold text-[#2E3856] dark:text-white flex items-center justify-center gap-1.5 transition-colors">
          <i data-lucide="layers" class="w-4 h-4 text-[#4255FF]"></i>
          <span>Học Thẻ nhớ</span>
        </button>
        <button onclick="window.appRouter.closeOxfordModal(); window.appRouter.navigate('quiz')" class="py-2.5 px-3 rounded-xl bg-[#4255FF] hover:bg-[#3644D9] text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md transition-colors">
          <i data-lucide="help-circle" class="w-4 h-4"></i>
          <span>Làm Trắc nghiệm</span>
        </button>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  highlightTargetWord(sentence, target) {
    if (!sentence || !target) return sentence || '';
    const clean = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${clean})\\b`, 'gi');
    return sentence.replace(regex, `<span class="text-[#4255FF] font-bold underline underline-offset-2">$1</span>`);
  }

  startFlashcardWithWord(wordId) {
    const word = window.appStorage.words.find(w => w.id === wordId);
    if (!word) return;
    this.navigate('flashcard');
    if (window.flashcardCtrl && window.flashcardCtrl.deck) {
      const idx = window.flashcardCtrl.deck.findIndex(w => w.id === wordId);
      if (idx !== -1) {
        window.flashcardCtrl.currentIndex = idx;
        window.flashcardCtrl.render();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
});
