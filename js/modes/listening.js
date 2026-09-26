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
        b.classList.add('bg-[#D97757]', 'text-white');
        b.classList.remove('bg-transparent', 'text-[#736D64]', 'dark:text-[#9E968D]');
      } else {
        b.classList.remove('bg-[#D97757]', 'text-white');
        b.classList.add('bg-transparent', 'text-[#736D64]', 'dark:text-[#9E968D]');
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
          <div class="p-3.5 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl text-[#10B981]">
            <div class="font-mono font-bold flex items-center gap-1.5 mb-1 text-sm">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Chính xác tuyệt đối!</span>
            </div>
            <p class="text-sm font-semibold">${word.word} ${word.phonetic ? `<span class="font-mono">[${word.phonetic}]</span>` : ''}: ${word.meaning}</p>
            ${word.example ? `<p class="text-xs text-[#1E1D1B] dark:text-[#EDE8E3] mt-1 italic">"${word.example}"</p>` : ''}
          </div>
        `;
      }
    } else {
      window.appAudio.playIncorrect();
      window.appStorage.recordWordResult(word.id, false);
      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="p-3.5 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl text-[#EF4444]">
            <div class="font-mono font-bold flex items-center gap-1.5 mb-1 text-sm">
              <i data-lucide="x" class="w-4 h-4"></i>
              <span>Chưa chính xác</span>
            </div>
            <p class="text-sm">Từ đúng: <strong class="text-[#D97757] font-mono font-bold">${word.word}</strong> ${word.phonetic ? `<span class="font-mono">[${word.phonetic}]</span>` : ''}</p>
            <p class="text-xs mt-1 text-[#1E1D1B] dark:text-[#EDE8E3]">Nghĩa: ${word.meaning}</p>
            ${word.example ? `<p class="text-xs text-[#736D64] dark:text-[#9E968D] mt-1 italic">"${word.example}"</p>` : ''}
          </div>
        `;
      }
    }

    // Đổi nút kiểm tra thành nút Câu tiếp theo
    const checkBtn = document.getElementById('btn-check-dictation');
    if (checkBtn) {
      checkBtn.innerHTML = `<span>$ next_word</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
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
          <div class="flex items-center justify-between mb-3 px-1 pb-2 border-b border-[#E6E1D8] dark:border-[#292522]">
            <span class="text-xs font-mono text-[#736D64] dark:text-[#9E968D]">&gt; word ${this.currentIndex + 1} / ${this.words.length}</span>
            <div class="flex items-center gap-1 bg-black/5 dark:bg-white/5 border border-[#E6E1D8] dark:border-[#332E2A] p-0.5 rounded-lg font-mono">
              <button data-rate="0.75" onclick="window.listeningCtrl.setRate(0.75)" class="rate-btn text-xs px-2 py-0.5 rounded font-bold ${this.audioRate === 0.75 ? 'bg-[#D97757] text-white' : 'text-[#736D64] dark:text-[#9E968D]'}">0.75x</button>
              <button data-rate="0.9" onclick="window.listeningCtrl.setRate(0.9)" class="rate-btn text-xs px-2 py-0.5 rounded font-bold ${this.audioRate === 0.9 ? 'bg-[#D97757] text-white' : 'text-[#736D64] dark:text-[#9E968D]'}">0.9x</button>
              <button data-rate="1.0" onclick="window.listeningCtrl.setRate(1.0)" class="rate-btn text-xs px-2 py-0.5 rounded font-bold ${this.audioRate === 1.0 ? 'bg-[#D97757] text-white' : 'text-[#736D64] dark:text-[#9E968D]'}">1.0x</button>
            </div>
          </div>

          <!-- Khối Loa phát âm thanh -->
          <div class="bg-white dark:bg-[#1E1C1A] border border-[#E6E1D8] dark:border-[#332E2A] rounded-2xl p-6 text-center shadow-sm mb-4">
            <button onclick="window.listeningCtrl.playCurrentAudio()" class="w-20 h-20 rounded-2xl bg-[#D97757]/15 hover:bg-[#D97757]/25 text-[#D97757] border border-[#D97757]/30 flex items-center justify-center mx-auto shadow-sm active:scale-95 transition-all">
              <i data-lucide="volume-2" class="w-10 h-10"></i>
            </button>
            <p class="text-xs font-mono text-[#736D64] dark:text-[#9E968D] mt-3">[Chạm để nghe phát âm]</p>
            
            ${word.example ? `
              <button onclick="window.listeningCtrl.playSentenceAudio()" class="mt-2 text-xs font-mono inline-flex items-center gap-1.5 text-[#D97757] hover:underline">
                <i data-lucide="play-circle" class="w-3.5 h-3.5"></i> Nghe câu ngữ cảnh Oxford
              </button>
            ` : ''}

            <!-- Gợi ý chữ cái -->
            <div id="dictation-hint" class="font-mono text-base tracking-widest text-[#D97757] mt-3 min-h-[24px]"></div>
          </div>

          <!-- Ô nhập chính tả -->
          <form onsubmit="event.preventDefault(); window.listeningCtrl.checkAnswer();" class="space-y-2.5">
            <div>
              <input id="dictation-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ bạn nghe được vào đây..." class="w-full text-center text-base md:text-lg font-mono font-bold py-3 px-4 bg-white dark:bg-[#1E1C1A] border border-[#E6E1D8] dark:border-[#332E2A] focus:border-[#D97757] focus:outline-none rounded-xl shadow-sm text-[#1E1D1B] dark:text-[#EDE8E3]" />
            </div>

            <div class="flex items-center gap-2">
              <button type="button" onclick="window.listeningCtrl.giveHint()" class="py-3 px-3.5 bg-black/5 dark:bg-white/5 border border-[#E6E1D8] dark:border-[#332E2A] text-[#1E1D1B] dark:text-[#EDE8E3] font-mono rounded-xl text-xs flex items-center gap-1.5">
                <i data-lucide="help-circle" class="w-3.5 h-3.5"></i> Gợi ý
              </button>

              <button id="btn-check-dictation" type="submit" class="flex-1 py-3 bg-[#D97757] hover:bg-[#E2856A] text-white font-mono font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all">
                <span>$ verify</span>
                <i data-lucide="check" class="w-4 h-4"></i>
              </button>
            </div>
          </form>

          <!-- Kết quả kiểm tra -->
          <div id="dictation-result" class="hidden mt-3"></div>
        </div>

        <!-- Điều hướng qua lại -->
        <div class="flex justify-between items-center text-xs font-mono text-[#736D64] dark:text-[#9E968D] pt-4">
          <button onclick="window.listeningCtrl.nextWord()" class="inline-flex items-center gap-1 hover:text-[#D97757]">
            <span>$ skip_word</span> <i data-lucide="skip-forward" class="w-3.5 h-3.5"></i>
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
