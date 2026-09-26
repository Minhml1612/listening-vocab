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
            <div class="flex justify-between text-xs font-mono text-[#736D64] dark:text-[#9E968D] mb-1">
              <span>&gt; card ${this.currentIndex + 1} / ${this.deck.length}</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="w-full bg-[#E6E1D8] dark:bg-[#292522] h-1.5 rounded-full overflow-hidden">
              <div class="bg-[#D97757] h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
            </div>
          </div>
          
          <button onclick="window.flashcardCtrl.shuffle()" class="p-2 rounded-xl text-[#736D64] dark:text-[#9E968D] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-[#E6E1D8] dark:hover:border-[#332E2A]" title="Trộn thẻ">
            <i data-lucide="shuffle" class="w-4 h-4"></i>
          </button>
          
          <button onclick="window.flashcardCtrl.toggleStar()" class="p-2 rounded-xl ${word.isStarred ? 'text-[#F59E0B]' : 'text-[#736D64] dark:text-[#6E675F]'} hover:bg-black/5 dark:hover:bg-white/5" title="Đánh dấu sao">
            <i data-lucide="star" class="w-4 h-4 ${word.isStarred ? 'fill-[#F59E0B]' : ''}"></i>
          </button>
        </div>

        <!-- Khối thẻ lật 3D chính -->
        <div class="perspective-1000 flex-1 my-2 cursor-pointer" onclick="window.flashcardCtrl.flip()">
          <div id="fc-card-inner" class="card-inner ${this.isFlipped ? 'is-flipped' : ''}">
            
            <!-- Mặt trước (Front) -->
            <div class="card-front bg-white dark:bg-[#1E1C1A] border border-[#E6E1D8] dark:border-[#332E2A] shadow-xl flex flex-col justify-between p-6 md:p-8 rounded-2xl">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md ${word.isNew ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 badge-pulse' : 'bg-black/5 dark:bg-white/5 text-[#736D64] dark:text-[#9E968D] border border-black/10 dark:border-white/10'}">
                  ${word.isNew ? '✨ Mới cập nhật' : (word.partOfSpeech || 'Từ vựng')}
                </span>
                
                <button type="button" onclick="event.stopPropagation(); window.flashcardCtrl.speakCurrentWord();" class="w-9 h-9 rounded-xl bg-[#D97757]/15 text-[#D97757] hover:bg-[#D97757]/25 flex items-center justify-center transition-transform active:scale-95 shadow-sm border border-[#D97757]/30">
                  <i data-lucide="volume-2" class="w-4 h-4"></i>
                </button>
              </div>

              <div class="text-center my-auto py-4">
                <h2 class="text-3xl md:text-4xl font-extrabold text-[#1E1D1B] dark:text-[#EDE8E3] tracking-tight font-sans">${word.word}</h2>
                ${word.phonetic ? `<p class="text-base font-semibold text-[#D97757] mt-2 font-mono">${word.phonetic}</p>` : ''}
              </div>

              <div class="text-center">
                <span class="text-xs font-mono text-[#736D64] dark:text-[#9E968D] inline-flex items-center gap-1.5">
                  <i data-lucide="rotate-cw" class="w-3.5 h-3.5 text-[#D97757]"></i> [Chạm để lật thẻ]
                </span>
              </div>
            </div>

            <!-- Mặt sau (Back) -->
            <div class="card-back bg-white dark:bg-[#1E1C1A] border border-[#E6E1D8] dark:border-[#332E2A] shadow-xl flex flex-col justify-between p-6 md:p-8 rounded-2xl overflow-y-auto">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[11px] font-mono uppercase tracking-wider text-[#D97757] bg-[#D97757]/10 px-2.5 py-0.5 rounded-md border border-[#D97757]/25">
                    ${word.partOfSpeech ? `Nghĩa • ${word.partOfSpeech}` : 'Nghĩa tiếng Việt'}
                  </span>
                  <button type="button" onclick="event.stopPropagation(); window.flashcardCtrl.speakCurrentWord();" class="text-[#D97757] p-1.5 hover:bg-[#D97757]/10 rounded-lg">
                    <i data-lucide="volume-2" class="w-4 h-4"></i>
                  </button>
                </div>
                
                <h3 class="text-2xl font-bold text-[#1E1D1B] dark:text-[#EDE8E3] mb-2 font-sans">${word.meaning}</h3>
                ${word.definition ? `<p class="text-xs text-[#736D64] dark:text-[#9E968D] italic mb-3 font-mono">${word.definition}</p>` : ''}
              </div>

              ${word.example ? `
                <div class="my-auto bg-[#FAF8F5] dark:bg-[#141312] p-3.5 rounded-xl border border-[#E6E1D8] dark:border-[#292522]">
                  <div class="flex items-center justify-between text-xs font-mono text-[#D97757] font-semibold mb-1">
                    <span>📖 Ngữ cảnh Oxford</span>
                    <div class="flex items-center gap-2">
                      <a href="https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent((word.word || '').toLowerCase().trim().replace(/\s+/g, '-'))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="text-[10px] text-[#D97757] font-bold hover:underline">
                        Oxford ↗
                      </a>
                      <button type="button" onclick="event.stopPropagation(); window.flashcardCtrl.speakExample();" class="p-1 hover:bg-[#D97757]/10 rounded" title="Nghe câu">
                        <i data-lucide="volume-1" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-[#1E1D1B] dark:text-[#EDE8E3] font-medium font-sans">${word.example}</p>
                  ${word.exampleVi ? `<p class="text-xs text-[#736D64] dark:text-[#9E968D] mt-1 italic">${word.exampleVi}</p>` : ''}
                </div>
              ` : ''}

              <div class="text-center pt-2">
                <span class="text-xs font-mono text-[#736D64] dark:text-[#9E968D] inline-flex items-center gap-1.5">
                  <i data-lucide="rotate-cw" class="w-3.5 h-3.5 text-[#D97757]"></i> [Chạm để lật lại]
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Điều khiển dưới cùng (Nút Đã nhớ / Chưa nhớ) -->
        <div class="pt-2">
          <div class="grid grid-cols-2 gap-2.5 mb-2">
            <button onclick="window.flashcardCtrl.animateSwipe('left')" class="py-3 px-4 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 rounded-xl font-mono font-bold text-xs md:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
              <i data-lucide="x" class="w-4 h-4"></i>
              <span>[← Chưa nhớ]</span>
            </button>
            <button onclick="window.flashcardCtrl.animateSwipe('right')" class="py-3 px-4 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/30 rounded-xl font-mono font-bold text-xs md:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>[Đã thuộc →]</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-xs font-mono text-[#736D64] dark:text-[#9E968D] px-1">
            <button id="fc-btn-autoplay" onclick="window.flashcardCtrl.toggleAutoPlay()" class="inline-flex items-center gap-1.5 font-semibold text-[#D97757] py-1.5 px-2.5 rounded-lg hover:bg-[#D97757]/10">
              <i data-lucide="play" class="w-3.5 h-3.5"></i>
              <span>$ autoplay</span>
            </button>
            
            <div class="flex items-center gap-1">
              <button onclick="window.flashcardCtrl.prev()" class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[#736D64] dark:text-[#9E968D]" title="Thẻ trước">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
              </button>
              <button onclick="window.flashcardCtrl.next()" class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[#736D64] dark:text-[#9E968D]" title="Thẻ sau">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
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
