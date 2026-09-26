/**
 * MATCH GAME MODE (GHÉP THẺ NHANH GIỐNG QUIZLET)
 * Trò chơi ghép từ tiếng Anh với nghĩa tiếng Việt tính giờ tốc độ cao
 */

class MatchController {
  constructor() {
    this.tiles = [];
    this.selectedTile = null;
    this.matchedCount = 0;
    this.totalPairs = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.isPlaying = false;
  }

  init(words) {
    if (!words || words.length < 3) {
      this.renderEmpty();
      return;
    }

    // Chọn ngẫu nhiên 6 cặp từ (hoặc số từ hiện có nếu ít hơn 6)
    const count = Math.min(6, words.length);
    const shuffledPool = [...words].sort(() => 0.5 - Math.random()).slice(0, count);

    this.totalPairs = shuffledPool.length;
    this.matchedCount = 0;
    this.selectedTile = null;
    this.elapsedSeconds = 0;
    this.isPlaying = true;

    // Tạo các thẻ: 1 nửa là từ tiếng Anh, 1 nửa là nghĩa tiếng Việt
    this.tiles = [];
    shuffledPool.forEach((w, idx) => {
      this.tiles.push({
        id: `tile-word-${idx}`,
        pairId: idx,
        type: 'word',
        text: w.word,
        phonetic: w.phonetic,
        audioUrl: w.audioUrl,
        matched: false
      });
      this.tiles.push({
        id: `tile-meaning-${idx}`,
        pairId: idx,
        type: 'meaning',
        text: w.meaning,
        matched: false
      });
    });

    // Trộn ngẫu nhiên vị trí các thẻ
    this.tiles.sort(() => 0.5 - Math.random());

    this.render();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.elapsedSeconds = ((Date.now() - this.startTime) / 1000).toFixed(1);
      const timerEl = document.getElementById('match-timer');
      if (timerEl) {
        timerEl.innerText = `${this.elapsedSeconds}s`;
      }
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTileClick(tileId) {
    if (!this.isPlaying) return;
    const tile = this.tiles.find(t => t.id === tileId);
    if (!tile || tile.matched) return;

    const tileEl = document.getElementById(tileId);

    // Nếu chưa chọn thẻ nào
    if (!this.selectedTile) {
      this.selectedTile = tile;
      if (tileEl) {
        tileEl.classList.add('ring-2', 'ring-[#D97757]', 'bg-[#D97757]/15', 'dark:bg-[#D97757]/20');
      }
      if (tile.type === 'word') {
        window.appAudio.speak(tile.text, { audioUrl: tile.audioUrl });
      }
      return;
    }

    // Nếu bấm lại chính thẻ đang chọn -> bỏ chọn
    if (this.selectedTile.id === tile.id) {
      this.clearSelection();
      return;
    }

    // Người dùng đã chọn 2 thẻ: Kiểm tra xem có khớp cặp không
    const firstTile = this.selectedTile;
    const secondTile = tile;
    const firstEl = document.getElementById(firstTile.id);
    const secondEl = document.getElementById(secondTile.id);

    if (firstTile.pairId === secondTile.pairId && firstTile.type !== secondTile.type) {
      // Ghép ĐÚNG!
      firstTile.matched = true;
      secondTile.matched = true;
      this.matchedCount++;
      window.appAudio.playCorrect();

      if (firstEl) {
        firstEl.classList.remove('ring-[#D97757]', 'bg-[#D97757]/15', 'dark:bg-[#D97757]/20');
        firstEl.classList.add('bg-[#10B981]/20', 'border-[#10B981]', 'opacity-0', 'scale-90', 'transition-all', 'duration-300');
      }
      if (secondEl) {
        secondEl.classList.add('bg-[#10B981]/20', 'border-[#10B981]', 'opacity-0', 'scale-90', 'transition-all', 'duration-300');
      }

      this.clearSelection();

      // Kiểm tra hoàn thành tất cả các cặp
      if (this.matchedCount >= this.totalPairs) {
        this.gameWin();
      }

    } else {
      // Ghép SAI!
      window.appAudio.playIncorrect();
      if (firstEl) firstEl.classList.add('border-[#EF4444]', 'bg-[#EF4444]/15', 'shake-it');
      if (secondEl) secondEl.classList.add('border-[#EF4444]', 'bg-[#EF4444]/15', 'shake-it');

      setTimeout(() => {
        this.clearSelection();
        if (firstEl) firstEl.classList.remove('border-[#EF4444]', 'bg-[#EF4444]/15', 'shake-it');
        if (secondEl) secondEl.classList.remove('border-[#EF4444]', 'bg-[#EF4444]/15', 'shake-it');
      }, 400);
    }
  }

  clearSelection() {
    if (this.selectedTile) {
      const el = document.getElementById(this.selectedTile.id);
      if (el) {
        el.classList.remove('ring-2', 'ring-[#D97757]', 'bg-[#D97757]/15', 'dark:bg-[#D97757]/20');
      }
      this.selectedTile = null;
    }
  }

  gameWin() {
    this.isPlaying = false;
    this.stopTimer();
    window.appAudio.playVictory();

    if (window.confetti) {
      window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    setTimeout(() => {
      this.renderVictory();
    }, 600);
  }

  render() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-md mx-auto flex flex-col min-h-[calc(100vh-140px)] justify-between pb-4">
        <!-- Top bar: Đồng hồ đếm thời gian & Số cặp -->
        <div class="flex items-center justify-between px-1 mb-3 pb-2 border-b border-[#E6E1D8] dark:border-[#292522]">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono uppercase tracking-wider text-[#736D64] dark:text-[#9E968D]">$ timer:</span>
            <span id="match-timer" class="font-mono text-xl font-bold text-[#D97757]">0.0s</span>
          </div>
          <button onclick="window.matchCtrl.init(window.appStorage.words)" class="p-2 text-[#736D64] dark:text-[#9E968D] hover:text-[#D97757] rounded-lg">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Lưới thẻ ghép 2 cột x 6 hàng -->
        <div class="grid grid-cols-2 gap-2 flex-1 content-start">
          ${this.tiles.map(tile => `
            <button id="${tile.id}" onclick="window.matchCtrl.handleTileClick('${tile.id}')" class="p-3 md:p-3.5 rounded-xl border border-[#E6E1D8] dark:border-[#332E2A] bg-white dark:bg-[#1E1C1A] hover:border-[#D97757]/60 shadow-sm min-h-[72px] md:min-h-[80px] flex flex-col justify-center items-center text-center transition-all duration-200 active:scale-95">
              <span class="font-bold ${tile.type === 'word' ? 'text-base text-[#1E1D1B] dark:text-[#EDE8E3] font-sans' : 'text-xs md:text-sm text-[#736D64] dark:text-[#9E968D] font-sans'}">
                ${tile.text}
              </span>
              ${tile.phonetic ? `<span class="text-[11px] font-mono text-[#D97757] mt-0.5">${tile.phonetic}</span>` : ''}
            </button>
          `).join('')}
        </div>

        <!-- Hướng dẫn nhanh -->
        <p class="text-center text-xs font-mono text-[#736D64] dark:text-[#9E968D] mt-3">
          $ match: chạm 1 từ tiếng Anh &amp; 1 nghĩa tương ứng
        </p>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderVictory() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-8 px-4">
        <div class="w-16 h-16 rounded-2xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <i data-lucide="zap" class="w-8 h-8"></i>
        </div>

        <h2 class="text-xl md:text-2xl font-bold font-sans text-[#1E1D1B] dark:text-[#EDE8E3]">
          Ghép thẻ thần tốc! ⚡
        </h2>
        <p class="text-xs font-mono text-[#736D64] dark:text-[#9E968D] mt-1">Thời gian hoàn thành: <span class="text-[#D97757] font-bold">${this.elapsedSeconds} giây</span></p>

        <div class="space-y-2 mt-6">
          <button onclick="window.matchCtrl.init(window.appStorage.words)" class="w-full py-3.5 bg-[#D97757] hover:bg-[#E2856A] text-white font-mono font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            <span>$ play-again</span>
          </button>
          <button onclick="window.appRouter.navigate('home')" class="w-full py-2.5 bg-black/5 dark:bg-white/5 border border-[#E6E1D8] dark:border-[#332E2A] text-[#1E1D1B] dark:text-[#EDE8E3] font-mono text-xs rounded-xl flex items-center justify-center gap-2">
            <span>$ return-home</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderEmpty() {
    const container = document.getElementById('mode-content');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-16 px-4">
          <p class="text-slate-500">Cần có ít nhất 3 từ vựng để chơi ghép thẻ.</p>
        </div>
      `;
    }
  }
}

window.matchCtrl = new MatchController();
