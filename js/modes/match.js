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
        tileEl.classList.add('ring-2', 'ring-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-950/80');
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
        firstEl.classList.remove('ring-indigo-600', 'bg-indigo-50');
        firstEl.classList.add('bg-emerald-100', 'dark:bg-emerald-950/80', 'border-emerald-500', 'opacity-0', 'scale-90', 'transition-all', 'duration-300');
      }
      if (secondEl) {
        secondEl.classList.add('bg-emerald-100', 'dark:bg-emerald-950/80', 'border-emerald-500', 'opacity-0', 'scale-90', 'transition-all', 'duration-300');
      }

      this.clearSelection();

      // Kiểm tra hoàn thành tất cả các cặp
      if (this.matchedCount >= this.totalPairs) {
        this.gameWin();
      }

    } else {
      // Ghép SAI!
      window.appAudio.playIncorrect();
      if (firstEl) firstEl.classList.add('border-rose-500', 'bg-rose-50', 'dark:bg-rose-950/60', 'shake-it');
      if (secondEl) secondEl.classList.add('border-rose-500', 'bg-rose-50', 'dark:bg-rose-950/60', 'shake-it');

      setTimeout(() => {
        this.clearSelection();
        if (firstEl) firstEl.classList.remove('border-rose-500', 'bg-rose-50', 'dark:bg-rose-950/60', 'shake-it');
        if (secondEl) secondEl.classList.remove('border-rose-500', 'bg-rose-50', 'dark:bg-rose-950/60', 'shake-it');
      }, 400);
    }
  }

  clearSelection() {
    if (this.selectedTile) {
      const el = document.getElementById(this.selectedTile.id);
      if (el) {
        el.classList.remove('ring-2', 'ring-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-950/80');
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
        <div class="flex items-center justify-between px-1 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Thời gian:</span>
            <span id="match-timer" class="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400">0.0s</span>
          </div>
          <button onclick="window.matchCtrl.init(window.appStorage.words)" class="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Lưới thẻ ghép 2 cột x 6 hàng (hoặc 3 cột x 4 hàng) -->
        <div class="grid grid-cols-2 gap-2.5 flex-1 content-start">
          ${this.tiles.map(tile => `
            <button id="${tile.id}" onclick="window.matchCtrl.handleTileClick('${tile.id}')" class="p-3 md:p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm min-h-[75px] md:min-h-[85px] flex flex-col justify-center items-center text-center transition-all duration-200 active:scale-95">
              <span class="font-bold ${tile.type === 'word' ? 'text-base md:text-lg text-slate-900 dark:text-white' : 'text-xs md:text-sm text-slate-700 dark:text-slate-200'}">
                ${tile.text}
              </span>
              ${tile.phonetic ? `<span class="text-[11px] font-mono text-indigo-500 mt-0.5">${tile.phonetic}</span>` : ''}
            </button>
          `).join('')}
        </div>

        <!-- Hướng dẫn nhanh -->
        <p class="text-center text-xs text-slate-400 mt-4">
          Chạm vào 1 từ tiếng Anh và 1 nghĩa tiếng Việt tương ứng để xóa chúng nhanh nhất có thể!
        </p>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderVictory() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-10 px-4">
        <div class="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
          <i data-lucide="zap" class="w-10 h-10"></i>
        </div>

        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white">Tuyệt vời! 🎉</h2>
        <p class="text-sm text-slate-500 mt-1">Bạn đã hoàn thành trò chơi ghép thẻ</p>

        <div class="my-6 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-xs mx-auto">
          <div class="text-xs uppercase font-bold text-slate-400 mb-1">Thời gian kỷ lục</div>
          <div class="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono">${this.elapsedSeconds}s</div>
        </div>

        <div class="space-y-3">
          <button onclick="window.matchCtrl.init(window.appStorage.words)" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-4 h-4"></i>
            <span>Chơi lượt mới</span>
          </button>
          <button onclick="window.appRouter.navigate('flashcard')" class="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2">
            <span>Quay lại học thẻ</span>
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
