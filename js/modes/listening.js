/**
 * LISTENING LAB MODE (PHÒNG LUYỆN NGHE CHUYÊN SÂU CHO BÀI TỰ HỌC LISTENING)
 * Luyện nghe chép chính tả, nghe đoán từ và kiểm tra ngữ cảnh câu nghe
 */

class ListeningController {
  constructor() {
    this.words = [];
    this.currentIndex = 0;
    this.audioRate = 0.9;
    this.revealedHintLetters = 0;
    this.isAnswerChecked = false;
  }

  init(words) {
    if (!words || words.length === 0) {
      this.renderEmpty();
      return;
    }

    this.words = [...words].sort(() => 0.5 - Math.random());
    this.currentIndex = 0;
    this.audioRate = 0.9;
    this.revealedHintLetters = 0;
    this.isAnswerChecked = false;

    this.render();
    setTimeout(() => this.playCurrentAudio(), 400);
  }

  getCurrentWord() {
    return this.words[this.currentIndex] || null;
  }

  setRate(rate) {
    this.audioRate = rate;
    const buttons = document.querySelectorAll('.rate-btn');
    buttons.forEach(b => {
      if (parseFloat(b.dataset.rate) === rate) {
        b.classList.add('bg-indigo-600', 'text-white');
        b.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-600');
      } else {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-600');
      }
    });
    this.playCurrentAudio();
  }

  playCurrentAudio() {
    const word = this.getCurrentWord();
    if (!word) return;
    window.appAudio.speak(word.word, {
      audioUrl: word.audioUrl,
      rate: this.audioRate
    });
  }

  playSentenceAudio() {
    const word = this.getCurrentWord();
    if (!word || !word.example) return;
    window.appAudio.speak(word.example, { rate: this.audioRate });
  }

  giveHint() {
    const word = this.getCurrentWord();
    if (!word) return;
    this.revealedHintLetters++;
    const hintEl = document.getElementById('dictation-hint');
    if (hintEl) {
      const target = word.word;
      const hintText = target.split('').map((char, idx) => {
        if (char === ' ' || char === '-') return char;
        if (idx < this.revealedHintLetters) return char;
        return '_';
      }).join(' ');
      hintEl.innerText = hintText;
    }
  }

  checkAnswer() {
    const word = this.getCurrentWord();
    if (!word || this.isAnswerChecked) return;

    const input = document.getElementById('dictation-input');
    if (!input) return;

    const userText = input.value.trim().toLowerCase();
    const correctText = word.word.trim().toLowerCase();
    const isCorrect = userText === correctText;

    this.isAnswerChecked = true;
    const resultBox = document.getElementById('dictation-result');

    if (isCorrect) {
      window.appAudio.playCorrect();
      window.appStorage.recordWordResult(word.id, true);
      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 rounded-xl text-emerald-800 dark:text-emerald-200">
            <div class="font-bold flex items-center gap-2 mb-1">
              <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600"></i>
              <span>Chính xác tuyệt đối!</span>
            </div>
            <p class="text-sm font-semibold">${word.word} ${word.phonetic ? `[${word.phonetic}]` : ''}: ${word.meaning}</p>
            ${word.example ? `<p class="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"${word.example}"</p>` : ''}
          </div>
        `;
      }
    } else {
      window.appAudio.playIncorrect();
      window.appStorage.recordWordResult(word.id, false);
      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-500 rounded-xl text-rose-800 dark:text-rose-200">
            <div class="font-bold flex items-center gap-2 mb-1">
              <i data-lucide="x-circle" class="w-5 h-5 text-rose-600"></i>
              <span>Chưa chính xác!</span>
            </div>
            <p class="text-sm">Từ đúng là: <strong class="text-indigo-600 dark:text-indigo-400 font-bold">${word.word}</strong> ${word.phonetic ? `[${word.phonetic}]` : ''}</p>
            <p class="text-xs mt-1 font-medium">Nghĩa: ${word.meaning}</p>
            ${word.example ? `<p class="text-xs text-slate-500 mt-1 italic">"${word.example}"</p>` : ''}
          </div>
        `;
      }
    }

    // Đổi nút kiểm tra thành nút Câu tiếp theo
    const checkBtn = document.getElementById('btn-check-dictation');
    if (checkBtn) {
      checkBtn.innerHTML = `<span>Từ tiếp theo</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
      checkBtn.onclick = () => this.nextWord();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  nextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.revealedHintLetters = 0;
    this.isAnswerChecked = false;
    this.render();
    setTimeout(() => this.playCurrentAudio(), 300);
  }

  render() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    const word = this.getCurrentWord();
    if (!word) return;

    container.innerHTML = `
      <div class="max-w-md mx-auto flex flex-col min-h-[calc(100vh-140px)] justify-between pb-4">
        <div>
          <!-- Header & Tốc độ phát -->
          <div class="flex items-center justify-between mb-4 px-1">
            <span class="text-xs font-bold text-slate-500">Từ ${this.currentIndex + 1} / ${this.words.length}</span>
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button data-rate="0.75" onclick="window.listeningCtrl.setRate(0.75)" class="rate-btn text-xs px-2.5 py-1 rounded-lg font-bold ${this.audioRate === 0.75 ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}">0.75x</button>
              <button data-rate="0.9" onclick="window.listeningCtrl.setRate(0.9)" class="rate-btn text-xs px-2.5 py-1 rounded-lg font-bold ${this.audioRate === 0.9 ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}">0.9x</button>
              <button data-rate="1.0" onclick="window.listeningCtrl.setRate(1.0)" class="rate-btn text-xs px-2.5 py-1 rounded-lg font-bold ${this.audioRate === 1.0 ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}">1.0x</button>
            </div>
          </div>

          <!-- Khối Loa phát âm thanh to rõ -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 md:p-8 text-center shadow-sm mb-5">
            <button onclick="window.listeningCtrl.playCurrentAudio()" class="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 active:scale-95 transition-all">
              <i data-lucide="volume-2" class="w-12 h-12"></i>
            </button>
            <p class="text-xs font-semibold text-slate-500 mt-4">Chạm nút để nghe lại phát âm</p>
            
            ${word.example ? `
              <button onclick="window.listeningCtrl.playSentenceAudio()" class="mt-3 text-xs inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                <i data-lucide="play-circle" class="w-4 h-4"></i> Nghe câu ngữ cảnh của từ
              </button>
            ` : ''}

            <!-- Chỗ hiển thị gợi ý chữ cái -->
            <div id="dictation-hint" class="font-mono text-base tracking-widest text-slate-400 mt-4 min-h-[24px]"></div>
          </div>

          <!-- Ô nhập chính tả -->
          <form onsubmit="event.preventDefault(); window.listeningCtrl.checkAnswer();" class="space-y-3">
            <div>
              <input id="dictation-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ bạn nghe được vào đây..." class="w-full text-center text-lg font-bold py-3.5 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none rounded-2xl shadow-sm text-slate-900 dark:text-white" />
            </div>

            <div class="flex items-center gap-2">
              <button type="button" onclick="window.listeningCtrl.giveHint()" class="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5">
                <i data-lucide="help-circle" class="w-4 h-4"></i> Gợi ý chữ
              </button>

              <button id="btn-check-dictation" type="submit" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
                <span>Kiểm tra</span>
                <i data-lucide="check" class="w-4 h-4"></i>
              </button>
            </div>
          </form>

          <!-- Kết quả kiểm tra -->
          <div id="dictation-result" class="hidden mt-4"></div>
        </div>

        <!-- Điều hướng qua lại -->
        <div class="flex justify-between items-center text-xs text-slate-400 pt-4">
          <button onclick="window.listeningCtrl.nextWord()" class="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-indigo-600">
            <span>Bỏ qua từ này</span> <i data-lucide="skip-forward" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const input = document.getElementById('dictation-input');
    if (input) input.focus();
  }

  renderEmpty() {
    const container = document.getElementById('mode-content');
    if (container) {
      container.innerHTML = `<div class="text-center py-16"><p class="text-slate-500">Chưa có từ vựng nào.</p></div>`;
    }
  }
}

window.listeningCtrl = new ListeningController();
