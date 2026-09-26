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
        b.classList.add('bg-[#4255FF]', 'text-white');
        b.classList.remove('bg-transparent', 'text-[#586380]', 'dark:text-[#939BB4]');
      } else {
        b.classList.remove('bg-[#4255FF]', 'text-white');
        b.classList.add('bg-transparent', 'text-[#586380]', 'dark:text-[#939BB4]');
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
          <div class="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200">
            <div class="font-bold flex items-center gap-1.5 mb-1 text-sm">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Chính xác tuyệt đối!</span>
            </div>
            <p class="text-sm font-semibold">${word.word} ${word.phonetic ? `<span class="font-mono text-emerald-600">[${word.phonetic}]</span>` : ''}: ${word.meaning}</p>
            ${word.example ? `<p class="text-xs text-[#2E3856] dark:text-[#F6F7FB] mt-1 italic">"${word.example}"</p>` : ''}
          </div>
        `;
      }
    } else {
      window.appAudio.playIncorrect();
      window.appStorage.recordWordResult(word.id, false);
      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200">
            <div class="font-bold flex items-center gap-1.5 mb-1 text-sm">
              <i data-lucide="x" class="w-4 h-4"></i>
              <span>Chưa chính xác</span>
            </div>
            <p class="text-sm">Từ đúng: <strong class="text-[#4255FF] font-bold">${word.word}</strong> ${word.phonetic ? `<span class="font-mono text-slate-500">[${word.phonetic}]</span>` : ''}</p>
            <p class="text-xs mt-1 text-[#2E3856] dark:text-[#F6F7FB]">Nghĩa: ${word.meaning}</p>
            ${word.example ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">"${word.example}"</p>` : ''}
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
      <div class="max-w-2xl lg:max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-140px)] justify-between pb-4">
        <div>
          <!-- Header & Tốc độ phát -->
          <div class="flex items-center justify-between mb-3 px-1 pb-2 border-b border-[#E5E8EF] dark:border-[#282E4E]">
            <span class="text-xs font-semibold text-[#586380] dark:text-[#939BB4]">Từ ${this.currentIndex + 1} / ${this.words.length}</span>
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] p-0.5 rounded-xl font-medium">
              <button data-rate="0.75" onclick="window.listeningCtrl.setRate(0.75)" class="rate-btn text-xs px-2.5 py-0.5 rounded-lg font-bold ${this.audioRate === 0.75 ? 'bg-[#4255FF] text-white' : 'text-[#586380] dark:text-[#939BB4]'}">0.75x</button>
              <button data-rate="0.9" onclick="window.listeningCtrl.setRate(0.9)" class="rate-btn text-xs px-2.5 py-0.5 rounded-lg font-bold ${this.audioRate === 0.9 ? 'bg-[#4255FF] text-white' : 'text-[#586380] dark:text-[#939BB4]'}">0.9x</button>
              <button data-rate="1.0" onclick="window.listeningCtrl.setRate(1.0)" class="rate-btn text-xs px-2.5 py-0.5 rounded-lg font-bold ${this.audioRate === 1.0 ? 'bg-[#4255FF] text-white' : 'text-[#586380] dark:text-[#939BB4]'}">1.0x</button>
            </div>
          </div>

          <!-- Khối Loa phát âm thanh -->
          <div class="bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] rounded-2xl p-6 text-center shadow-sm mb-4">
            <button onclick="window.listeningCtrl.playCurrentAudio()" class="w-20 h-20 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#4255FF] border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mx-auto shadow-sm active:scale-95 transition-all">
              <i data-lucide="volume-2" class="w-10 h-10"></i>
            </button>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-3 font-medium">Bấm để nghe phát âm</p>
            
            ${word.example ? `
              <button onclick="window.listeningCtrl.playSentenceAudio()" class="mt-2 text-xs font-bold inline-flex items-center gap-1.5 text-[#4255FF] hover:underline">
                <i data-lucide="play-circle" class="w-4 h-4"></i> Nghe câu ví dụ Oxford
              </button>
            ` : ''}

            <!-- Gợi ý chữ cái -->
            <div id="dictation-hint" class="font-mono text-base font-bold tracking-widest text-[#4255FF] mt-3 min-h-[24px]"></div>
          </div>

          <!-- Ô nhập chính tả -->
          <form onsubmit="event.preventDefault(); window.listeningCtrl.checkAnswer();" class="space-y-2.5">
            <div>
              <input id="dictation-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ bạn nghe được vào đây..." class="w-full text-center text-base md:text-lg font-bold py-3 px-4 bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] focus:border-[#4255FF] focus:outline-none rounded-xl shadow-sm text-[#2E3856] dark:text-white" />
            </div>

            <div class="flex items-center gap-2">
              <button type="button" onclick="window.listeningCtrl.giveHint()" class="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] text-[#2E3856] dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors">
                <i data-lucide="help-circle" class="w-4 h-4"></i> Gợi ý
              </button>

              <button id="btn-check-dictation" type="submit" class="flex-1 py-3 bg-[#4255FF] hover:bg-[#3644D9] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all">
                <span>Kiểm tra</span>
                <i data-lucide="check" class="w-4 h-4"></i>
              </button>
            </div>
          </form>

          <!-- Kết quả kiểm tra -->
          <div id="dictation-result" class="hidden mt-3"></div>
        </div>

        <!-- Điều hướng qua lại -->
        <div class="flex justify-between items-center text-xs pt-4">
          <button onclick="window.listeningCtrl.nextWord()" class="inline-flex items-center gap-1 text-slate-400 hover:text-[#4255FF] font-semibold transition-colors">
            <span>Bỏ qua từ này</span> <i data-lucide="skip-forward" class="w-3.5 h-3.5"></i>
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
