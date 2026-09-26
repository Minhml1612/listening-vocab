/**
 * QUIZ / TRẮC NGHIỆM MODE (v3.0 - Chuyên sâu bài tập ngữ cảnh Oxford)
 * Tạo bài tập điền từ vào câu ngữ cảnh Oxford, nghe cả câu chọn từ, hiệu ứng âm thanh & giải thích
 */

class QuizController {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.wrongAnswers = [];
    this.answered = false;
    this.subMode = 'context'; // 'context' (mặc định 100% ngữ cảnh Oxford) | 'listening' | 'mixed'
    this.activeWordsPool = [];
  }

  init(words, count = 10, subMode = 'context') {
    if (!words || words.length === 0) {
      this.renderEmpty();
      return;
    }

    this.activeWordsPool = words.filter(w => w && w.word && w.word.trim().length >= 2);
    this.subMode = subMode;
    this.questions = this.buildQuizSet(this.activeWordsPool, count, this.subMode);
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.wrongAnswers = [];
    this.answered = false;

    this.renderQuestion();
  }

  switchSubMode(newMode) {
    this.init(this.activeWordsPool, 10, newMode);
  }

  buildQuizSet(words, count = 10, subMode = 'context') {
    const list = [...words];
    // Trộn ngẫu nhiên danh sách từ
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    const selectedWords = list.slice(0, Math.min(count, list.length));
    const allQuestions = [];

    selectedWords.forEach(w => {
      const generated = window.appEnricher.createQuizQuestions(w, words);
      if (generated && generated.length > 0) {
        if (subMode === 'context') {
          // 100% BÀI TẬP NGỮ CẢNH OXFORD
          allQuestions.push(generated[0]);
        } else if (subMode === 'listening') {
          // 100% NGHE CÂU NGỮ CẢNH
          allQuestions.push(generated[1] || generated[0]);
        } else {
          // Trộn các dạng
          const randIdx = Math.floor(Math.random() * generated.length);
          allQuestions.push(generated[randIdx]);
        }
      }
    });

    return allQuestions;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  renderQuestion() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    const q = this.getCurrentQuestion();
    if (!q) {
      this.renderSummary();
      return;
    }

    this.answered = false;
    const progressPercent = Math.round(((this.currentIndex) / this.questions.length) * 100);

    // Tự động phát âm nếu là dạng bài nghe ngữ cảnh
    if (q.type === 'listening-context') {
      setTimeout(() => {
        this.playFullSentenceAudio();
      }, 350);
    }

    container.innerHTML = `
      <div class="max-w-md mx-auto flex flex-col min-h-[calc(100vh-140px)] md:min-h-[580px] justify-between pb-4">
        <div>
          <!-- Tab chuyển chế độ bài tập -->
          <div class="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-3 text-[11px] font-bold">
            <button onclick="window.quizCtrl.switchSubMode('context')" class="py-1.5 px-2 rounded-lg transition-all ${this.subMode === 'context' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
              📖 Ngữ cảnh Oxford
            </button>
            <button onclick="window.quizCtrl.switchSubMode('listening')" class="py-1.5 px-2 rounded-lg transition-all ${this.subMode === 'listening' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
              🎧 Nghe câu ngữ cảnh
            </button>
            <button onclick="window.quizCtrl.switchSubMode('mixed')" class="py-1.5 px-2 rounded-lg transition-all ${this.subMode === 'mixed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
              🔄 Trộn các dạng
            </button>
          </div>

          <!-- Top Stats: Tiến độ & Streak -->
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 px-1">
            <span>Câu ${this.currentIndex + 1} / ${this.questions.length}</span>
            <div class="flex items-center gap-3">
              ${this.streak > 1 ? `
                <span class="inline-flex items-center gap-1 text-amber-500 font-bold animate-pulse">
                  🔥 ${this.streak} chuỗi
                </span>
              ` : ''}
              <span class="text-indigo-600 dark:text-indigo-400 font-bold">Điểm: ${this.score}</span>
            </div>
          </div>
          
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
            <div class="bg-indigo-600 h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
          </div>

          <!-- KHUNG CÂU HỎI NGỮ CẢNH CHUẨN OXFORD -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 shadow-sm mb-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                <span>${q.title}</span>
              </span>

              ${q.fullSentence ? `
                <button onclick="window.quizCtrl.playFullSentenceAudio()" class="text-indigo-600 dark:text-indigo-400 p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg active:scale-95 transition-all" title="Nghe câu phát âm">
                  <i data-lucide="volume-2" class="w-5 h-5"></i>
                </button>
              ` : ''}
            </div>

            ${(q.type === 'sentence-gap' || q.type === 'listening-context') ? `
              <div class="py-1">
                <!-- Câu ngữ cảnh có ô trống -->
                <div class="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-3">
                  <p class="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                    ${this.formatPromptWithBlank(q.prompt)}
                  </p>
                </div>

                ${q.hint ? `
                  <div class="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span class="font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">💡 Gợi ý ngữ cảnh:</span>
                    <span>${q.hint}</span>
                  </div>
                ` : ''}

                ${q.type === 'listening-context' ? `
                  <button onclick="window.quizCtrl.playFullSentenceAudio()" class="mt-3 w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all">
                    <i data-lucide="volume-2" class="w-4 h-4"></i>
                    <span>Bấm để nghe lại toàn bộ câu ngữ cảnh</span>
                  </button>
                ` : ''}
              </div>
            ` : `
              <!-- Dạng chọn nghĩa -->
              <div class="text-center py-4">
                <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${q.prompt}</h3>
                ${q.phonetic ? `<p class="text-sm font-mono text-indigo-600 dark:text-indigo-400 mt-1">${q.phonetic}</p>` : ''}
                <button onclick="window.quizCtrl.playQuestionAudio()" class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 mt-2 font-medium">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Nghe phát âm từ
                </button>
              </div>
            `}
          </div>

          <!-- Danh sách 4 Lựa chọn -->
          <div id="quiz-options" class="space-y-2.5">
            ${q.options.map((opt, idx) => `
              <button onclick="window.quizCtrl.selectOption(${idx}, '${this.escapeHtml(opt)}')" class="quiz-option-btn w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center justify-between active:scale-[0.99] shadow-sm">
                <span>${opt}</span>
                <span class="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-400 option-badge font-mono">
                  ${String.fromCharCode(65 + idx)}
                </span>
              </button>
            `).join('')}
          </div>

          <!-- Khung giải thích chi tiết & Câu hoàn chỉnh -->
          <div id="quiz-explanation" class="hidden mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          </div>
        </div>

        <!-- Nút Tiếp tục -->
        <div id="quiz-next-container" class="hidden pt-4">
          <button onclick="window.quizCtrl.nextQuestion()" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 active:scale-98 transition-all flex items-center justify-center gap-2">
            <span>Tiếp tục câu sau</span>
            <i data-lucide="arrow-right" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  formatPromptWithBlank(prompt) {
    if (!prompt) return '';
    return prompt.replace(/________/g, `<span class="inline-block px-3 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-dashed border-indigo-400 font-mono font-bold tracking-wider mx-1">________</span>`);
  }

  highlightWord(sentence, targetWord) {
    if (!sentence || !targetWord) return sentence || '';
    const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi');
    return sentence.replace(regex, `<span class="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-400/60">$1</span>`);
  }

  playFullSentenceAudio() {
    const q = this.getCurrentQuestion();
    if (!q || !q.fullSentence) return;
    window.appAudio.speak(q.fullSentence, { rate: 0.9 });
  }

  playQuestionAudio() {
    const q = this.getCurrentQuestion();
    if (!q) return;
    const targetWord = q.wordItem ? q.wordItem.word : (q.listenWord || q.prompt);
    window.appAudio.speak(targetWord, { audioUrl: q.audioUrl });
  }

  selectOption(selectedIndex, selectedText) {
    if (this.answered) return;
    this.answered = true;

    const q = this.getCurrentQuestion();
    const isCorrect = selectedText.trim() === q.correctAnswer.trim();
    const optionButtons = document.querySelectorAll('.quiz-option-btn');

    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      const optText = q.options[idx].trim();
      const badge = btn.querySelector('.option-badge');

      if (optText === q.correctAnswer.trim()) {
        btn.classList.remove('bg-white', 'dark:bg-slate-800', 'border-slate-200');
        btn.classList.add('bg-emerald-50', 'dark:bg-emerald-950/60', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300', 'font-bold');
        if (badge) badge.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i>`;
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.remove('bg-white', 'dark:bg-slate-800', 'border-slate-200');
        btn.classList.add('bg-rose-50', 'dark:bg-rose-950/60', 'border-rose-500', 'text-rose-700', 'dark:text-rose-300', 'shake-it');
        if (badge) badge.innerHTML = `<i data-lucide="x" class="w-3.5 h-3.5 text-rose-600"></i>`;
      }
    });

    if (isCorrect) {
      this.score++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      window.appAudio.playCorrect();
    } else {
      this.streak = 0;
      this.wrongAnswers.push(q);
      window.appAudio.playIncorrect();
    }

    if (q.wordItem) {
      window.appStorage.recordWordResult(q.wordItem.id, isCorrect);
    }

    this.showExplanation(q, isCorrect);

    const nextContainer = document.getElementById('quiz-next-container');
    if (nextContainer) nextContainer.classList.remove('hidden');

    if (window.lucide) window.lucide.createIcons();
  }

  showExplanation(q, isCorrect) {
    const expBox = document.getElementById('quiz-explanation');
    if (!expBox) return;

    const w = q.wordItem;
    expBox.classList.remove('hidden');
    expBox.innerHTML = `
      <div class="flex items-start gap-2.5">
        <div class="mt-0.5 p-1 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
          <i data-lucide="${isCorrect ? 'check-circle' : 'alert-circle'}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 text-xs">
          <div class="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
            ${isCorrect ? 'Tuyệt vời, chính xác! 🎯' : `Đáp án đúng là: <span class="text-emerald-600 font-extrabold">${q.correctAnswer}</span>`}
          </div>

          ${q.fullSentence ? `
            <div class="p-3 bg-white dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 my-2">
              <div class="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                <span>Câu chuẩn Oxford:</span>
                <button type="button" onclick="window.quizCtrl.playFullSentenceAudio()" class="inline-flex items-center gap-1 hover:underline text-indigo-600 dark:text-indigo-400">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Nghe đọc cả câu
                </button>
              </div>
              <p class="text-slate-800 dark:text-slate-100 font-medium text-xs leading-relaxed mb-1">
                ${this.highlightWord(q.fullSentence, q.correctAnswer)}
              </p>
              ${q.exampleVi ? `<p class="text-slate-500 dark:text-slate-400 italic">${q.exampleVi}</p>` : ''}
            </div>
          ` : ''}

          ${w ? `
            <p class="text-slate-600 dark:text-slate-300 font-medium mt-1">
              <span class="font-bold text-indigo-600 dark:text-indigo-400">${w.word}</span> ${w.partOfSpeech ? `(${w.partOfSpeech})` : ''}: ${w.meaning}
            </p>
          ` : ''}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex < this.questions.length) {
      this.renderQuestion();
    } else {
      this.renderSummary();
    }
  }

  renderSummary() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    const total = this.questions.length;
    const percent = Math.round((this.score / total) * 100);

    window.appStorage.recordStudySession(this.score, total);

    if (percent >= 70) {
      window.appAudio.playVictory();
      this.triggerConfetti();
    }

    container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-6 px-4">
        <div class="w-20 h-20 rounded-full ${percent >= 70 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'} flex items-center justify-center mx-auto mb-4 shadow-lg">
          <i data-lucide="${percent >= 70 ? 'trophy' : 'award'}" class="w-10 h-10"></i>
        </div>

        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
          ${percent >= 90 ? 'Xuất sắc tuyệt đối! 🎯' : percent >= 70 ? 'Luyện ngữ cảnh rất tốt! 👏' : 'Tiếp tục rèn luyện nhé! 💪'}
        </h2>
        
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Bạn vừa hoàn thành 10 câu bài tập ngữ cảnh Oxford</p>

        <!-- Thẻ điểm -->
        <div class="grid grid-cols-3 gap-2.5 my-6">
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400">${this.score}/${total}</div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Số câu đúng</div>
          </div>
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">${percent}%</div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Độ chính xác</div>
          </div>
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div class="text-2xl font-black text-amber-500">🔥 ${this.maxStreak}</div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Chuỗi cao nhất</div>
          </div>
        </div>

        <!-- Các nút bấm -->
        <div class="space-y-2.5">
          ${this.wrongAnswers.length > 0 ? `
            <button onclick="window.quizCtrl.retryWrongAnswers()" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Luyện lại ${this.wrongAnswers.length} câu làm sai</span>
            </button>
          ` : ''}

          <button onclick="window.quizCtrl.init(window.appStorage.words, 10, '${this.subMode}')" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-4 h-4"></i>
            <span>Làm tiếp 10 câu ngữ cảnh mới</span>
          </button>

          <button onclick="window.appRouter.navigate('flashcard')" class="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2">
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>Quay lại học thẻ ghi nhớ</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  retryWrongAnswers() {
    this.questions = [...this.wrongAnswers];
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.wrongAnswers = [];
    this.renderQuestion();
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  renderEmpty() {
    const container = document.getElementById('mode-content');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-16 px-4">
          <p class="text-slate-500">Cần có ít nhất vài từ vựng để tạo bài tập ngữ cảnh.</p>
        </div>
      `;
    }
  }
}

window.quizCtrl = new QuizController();
