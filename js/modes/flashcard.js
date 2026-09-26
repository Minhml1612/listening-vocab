/**
 * FLASHCARD MODE (THẺ GHI NHỚ QUIZLET)
 * Hỗ trợ lật thẻ 3D, vuốt trên điện thoại, tự động phát âm và chế độ rảnh tay
 */

class FlashcardController {
  constructor() {
    this.deck = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.isAutoPlaying = false;
    this.autoPlayTimer = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  init(words) {
    this.deck = [...words];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.stopAutoPlay();
    this.render();
    this.bindTouchEvents();
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    this.render();
  }

  getCurrentWord() {
    return this.deck[this.currentIndex] || null;
  }

  flip() {
    const cardInner = document.getElementById('fc-card-inner');
    if (!cardInner) return;

    this.isFlipped = !this.isFlipped;
    cardInner.classList.toggle('is-flipped', this.isFlipped);
    window.appAudio.playFlip();

    const currentWord = this.getCurrentWord();
    if (this.isFlipped && currentWord && window.appStorage.settings.autoSpeakOnFlip) {
      // Khi lật ra mặt sau có thể đọc lại hoặc đọc ví dụ
    }
  }

  next(markMastered = null) {
    const currentWord = this.getCurrentWord();
    if (currentWord && markMastered !== null) {
      window.appStorage.toggleMastered(currentWord.id, markMastered);
    }

    if (this.currentIndex < this.deck.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Vòng lặp lại
    }

    this.isFlipped = false;
    this.render();
    this.speakCurrentWord();
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.deck.length - 1;
    }
    this.isFlipped = false;
    this.render();
    this.speakCurrentWord();
  }

  speakCurrentWord(forceSynth = false) {
    const word = this.getCurrentWord();
    if (!word) return;
    window.appAudio.speak(word.word, {
      audioUrl: word.audioUrl,
      forceSynth: forceSynth
    });
  }

  speakExample() {
    const word = this.getCurrentWord();
    if (!word || !word.example) return;
    window.appAudio.speak(word.example);
  }

  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    const btn = document.getElementById('fc-btn-autoplay');
    if (btn) {
      btn.innerHTML = this.isAutoPlaying
        ? `<i data-lucide="pause" class="w-5 h-5"></i><span>Dừng rảnh tay</span>`
        : `<i data-lucide="play" class="w-5 h-5"></i><span>Tự động rảnh tay</span>`;
      if (window.lucide) window.lucide.createIcons();
    }

    if (this.isAutoPlaying) {
      this.runAutoPlayStep();
    } else {
      this.stopAutoPlay();
    }
  }

  stopAutoPlay() {
    this.isAutoPlaying = false;
    if (this.autoPlayTimer) clearTimeout(this.autoPlayTimer);
    const btn = document.getElementById('fc-btn-autoplay');
    if (btn) {
      btn.innerHTML = `<i data-lucide="play" class="w-5 h-5"></i><span>Tự động rảnh tay</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  runAutoPlayStep() {
    if (!this.isAutoPlaying) return;
    const word = this.getCurrentWord();
    if (!word) return;

    // Bước 1: Đọc từ tiếng Anh ở mặt trước
    this.isFlipped = false;
    this.renderCardState();
    window.appAudio.speak(word.word, {
      audioUrl: word.audioUrl,
      onEnd: () => {
        if (!this.isAutoPlaying) return;
        // Chờ 1.5 giây rồi lật thẻ
        this.autoPlayTimer = setTimeout(() => {
          if (!this.isAutoPlaying) return;
          this.flip();

          // Chờ 2.5 giây rồi chuyển thẻ tiếp theo
          this.autoPlayTimer = setTimeout(() => {
            if (!this.isAutoPlaying) return;
            this.next();
            this.runAutoPlayStep();
          }, 2500);
        }, 1500);
      }
    });
  }

  bindTouchEvents() {
    const container = document.getElementById('fc-container');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - this.touchStartX;
      const diffY = touchEndY - this.touchStartY;

      // Vuốt ngang ít nhất 60px và không phải cuộn dọc
      if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          // Vuốt sang phải -> Đã thuộc
          this.animateSwipe('right');
        } else {
          // Vuốt sang trái -> Chưa nhớ
          this.animateSwipe('left');
        }
      }
    }, { passive: true });
  }

  animateSwipe(direction) {
    const card = document.getElementById('fc-card-inner');
    if (!card) return;

    card.classList.add(direction === 'right' ? 'card-swiping-right' : 'card-swiping-left');
    window.appAudio.vibrate([30]);

    setTimeout(() => {
      card.classList.remove('card-swiping-right', 'card-swiping-left');
      this.next(direction === 'right');
    }, 280);
  }

  render() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    if (!this.deck || this.deck.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 px-4">
          <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/60 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-4">
            <i data-lucide="layers" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Chưa có từ vựng nào</h3>
          <p class="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Hãy thêm từ vựng hoặc đồng bộ từ Google Docs để bắt đầu học nhé!</p>
          <button onclick="window.appSync.sync()" class="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm inline-flex items-center gap-2">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i> Đồng bộ ngay
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const word = this.getCurrentWord();
    const progressPercent = Math.round(((this.currentIndex + 1) / this.deck.length) * 100);

    container.innerHTML = `
      <div id="fc-container" class="max-w-md mx-auto flex flex-col h-[calc(100vh-140px)] md:h-[620px] justify-between pb-2">
        <!-- Header Thanh tiến độ & Điều khiển -->
        <div class="flex items-center justify-between gap-3 mb-2 px-1">
          <div class="flex-1">
            <div class="flex justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Thẻ ${this.currentIndex + 1} / ${this.deck.length}</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-600 h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
            </div>
          </div>
          
          <button onclick="window.flashcardCtrl.shuffle()" class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="Trộn thẻ">
            <i data-lucide="shuffle" class="w-5 h-5"></i>
          </button>
          
          <button onclick="window.flashcardCtrl.toggleStar()" class="p-2 rounded-xl ${word.isStarred ? 'text-amber-500' : 'text-slate-400'} hover:bg-slate-100 dark:hover:bg-slate-800" title="Đánh dấu sao">
            <i data-lucide="star" class="w-5 h-5 ${word.isStarred ? 'fill-amber-500' : ''}"></i>
          </button>
        </div>

        <!-- Khối thẻ lật 3D chính -->
        <div class="perspective-1000 flex-1 my-2 cursor-pointer" onclick="window.flashcardCtrl.flip()">
          <div id="fc-card-inner" class="card-inner ${this.isFlipped ? 'is-flipped' : ''}">
            
            <!-- Mặt trước (Front) -->
            <div class="card-front bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xl flex flex-col justify-between p-6 md:p-8">
              <div class="flex items-center justify-between">
                <span class="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${word.isNew ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 badge-pulse' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
                  ${word.isNew ? '✨ Mới cập nhật' : (word.partOfSpeech || 'Từ vựng')}
                </span>
                
                <button type="button" onclick="event.stopPropagation(); window.flashcardCtrl.speakCurrentWord();" class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                  <i data-lucide="volume-2" class="w-5 h-5"></i>
                </button>
              </div>

              <div class="text-center my-auto py-4">
                <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">${word.word}</h2>
                ${word.phonetic ? `<p class="text-base font-medium text-indigo-600 dark:text-indigo-400 mt-2 font-mono">${word.phonetic}</p>` : ''}
              </div>

              <div class="text-center">
                <span class="text-xs text-slate-400 inline-flex items-center gap-1.5 font-medium">
                  <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i> Chạm để xem nghĩa & ví dụ
                </span>
              </div>
            </div>

            <!-- Mặt sau (Back) -->
            <div class="card-back bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border border-indigo-200 dark:border-slate-700 shadow-xl flex flex-col justify-between p-6 md:p-8 overflow-y-auto">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                    ${word.partOfSpeech ? `Nghĩa • ${word.partOfSpeech}` : 'Nghĩa tiếng Việt'}
                  </span>
                  <button type="button" onclick="event.stopPropagation(); window.flashcardCtrl.speakCurrentWord();" class="text-indigo-600 dark:text-indigo-400 p-1.5 hover:bg-indigo-100/50 rounded-lg">
                    <i data-lucide="volume-2" class="w-5 h-5"></i>
                  </button>
                </div>
                
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">${word.meaning}</h3>
                ${word.definition ? `<p class="text-xs text-slate-500 dark:text-slate-400 italic mb-4">${word.definition}</p>` : ''}
              </div>

              ${word.example ? `
                <div class="my-auto bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-xl border border-indigo-100 dark:border-slate-700">
                  <div class="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                    <span>📖 Ngữ cảnh Oxford</span>
                    <div class="flex items-center gap-2">
                      <a href="https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent((word.word || '').toLowerCase().trim().replace(/\s+/g, '-'))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        Oxford ↗
                      </a>
                      <button type="button" onclick="event.stopPropagation(); window.flashcardCtrl.speakExample();" class="p-1 hover:bg-indigo-50 rounded" title="Nghe câu">
                        <i data-lucide="volume-1" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-slate-700 dark:text-slate-200 font-medium">${word.example}</p>
                  ${word.exampleVi ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${word.exampleVi}</p>` : ''}
                </div>
              ` : ''}

              <div class="text-center pt-2">
                <span class="text-xs text-slate-400 inline-flex items-center gap-1.5">
                  <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i> Chạm để lật lại mặt trước
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Điều khiển dưới cùng (Nút Đã nhớ / Chưa nhớ) -->
        <div class="pt-2">
          <div class="grid grid-cols-2 gap-3 mb-2">
            <button onclick="window.flashcardCtrl.animateSwipe('left')" class="py-3 px-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
              <i data-lucide="x" class="w-5 h-5"></i>
              <span>Chưa nhớ (Vuốt trái)</span>
            </button>
            <button onclick="window.flashcardCtrl.animateSwipe('right')" class="py-3 px-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
              <i data-lucide="check" class="w-5 h-5"></i>
              <span>Đã thuộc (Vuốt phải)</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-500 px-2">
            <button id="fc-btn-autoplay" onclick="window.flashcardCtrl.toggleAutoPlay()" class="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 py-1.5 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800">
              <i data-lucide="play" class="w-4 h-4"></i>
              <span>Tự động rảnh tay</span>
            </button>
            
            <div class="flex items-center gap-1">
              <button onclick="window.flashcardCtrl.prev()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Thẻ trước">
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
              </button>
              <button onclick="window.flashcardCtrl.next()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Thẻ sau">
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderCardState() {
    const cardInner = document.getElementById('fc-card-inner');
    if (cardInner) {
      cardInner.classList.toggle('is-flipped', this.isFlipped);
    }
  }

  toggleStar() {
    const word = this.getCurrentWord();
    if (!word) return;
    window.appStorage.toggleStar(word.id);
    this.render();
  }
}

window.flashcardCtrl = new FlashcardController();
