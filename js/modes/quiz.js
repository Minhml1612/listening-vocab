/**
 * QUIZ / TRẮC NGHIỆM MODE
 * Tạo câu hỏi ngữ cảnh, câu hỏi nghĩa, trắc nghiệm nghe hiểu với hiệu ứng âm thanh & vinh danh
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
  }

  init(words, count = 10) {
    if (!words || words.length === 0) {
      this.renderEmpty();
      return;
    }

    this.questions = this.buildQuizSet(words, count);
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.wrongAnswers = [];
    this.answered = false;

    this.renderQuestion();
  }

  buildQuizSet(words, count) {
    const list = [...words];
    // Trộn danh sách từ
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    const selectedWords = list.slice(0, Math.min(count, list.length));
    const allQuestions = [];

    selectedWords.forEach(w => {
      // Mỗi từ sinh ra 1 câu hỏi ngẫu nhiên trong 3 dạng
      const generated = window.appEnricher.createQuizQuestions(w, words, 3);
      if (generated && generated.length > 0) {
        const randQ = generated[Math.floor(Math.random() * generated.length)];
        allQuestions.push(randQ);
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

    // Tự động phát âm thanh nếu là câu hỏi nghe
    if (q.type === 'listening-select') {
      setTimeout(() => {
        window.appAudio.speak(q.listenWord, { audioUrl: q.audioUrl });
      }, 300);
    }

    container.innerHTML = `
      <div class="max-w-md mx-auto flex flex-col min-h-[calc(100vh-140px)] md:min-h-[580px] justify-between pb-4">
        <!-- Top Stats: Tiến độ & Streak -->
        <div>
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
          
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-5">
            <div class="bg-indigo-600 h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
          </div>

          <!-- Khung câu hỏi -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-sm mb-4">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full mb-3 inline-block">
              ${q.title}
            </span>

            ${q.type === 'listening-select' ? `
              <div class="text-center py-6">
                <button onclick="window.quizCtrl.playQuestionAudio()" class="w-16 h-16 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 active:scale-95 transition-all">
                  <i data-lucide="volume-2" class="w-8 h-8"></i>
                </button>
                <p class="text-xs font-semibold text-slate-500 mt-3">Chạm loa để nghe lại từ vựng</p>
              </div>
            ` : q.type === 'sentence-gap' ? `
              <div class="py-2">
                <p class="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">${q.prompt}</p>
                ${q.hint ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">Gợi ý nghĩa: ${q.hint}</p>` : ''}
              </div>
            ` : `
              <div class="text-center py-3">
                <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${q.prompt}</h3>
                ${q.phonetic ? `<p class="text-sm font-mono text-indigo-600 dark:text-indigo-400 mt-1">${q.phonetic}</p>` : ''}
                <button onclick="window.quizCtrl.playQuestionAudio()" class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 mt-2 font-medium">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Nghe phát âm
                </button>
              </div>
            `}
          </div>

          <!-- Danh sách 4 Lựa chọn -->
          <div id="quiz-options" class="space-y-2.5">
            ${q.options.map((opt, idx) => `
              <button onclick="window.quizCtrl.selectOption(${idx}, '${this.escapeHtml(opt)}')" class="quiz-option-btn w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center justify-between active:scale-[0.99] shadow-sm">
                <span>${opt}</span>
                <span class="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-400 option-badge">
                  ${String.fromCharCode(65 + idx)}
                </span>
              </button>
            `).join('')}
          </div>

          <!-- Khung giải thích (ẩn cho tới khi trả lời) -->
          <div id="quiz-explanation" class="hidden mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          </div>
        </div>

        <!-- Nút Tiếp tục (ẩn ban đầu) -->
        <div id="quiz-next-container" class="hidden pt-4">
          <button onclick="window.quizCtrl.nextQuestion()" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 active:scale-98 transition-all flex items-center justify-center gap-2">
            <span>Tiếp tục</span>
            <i data-lucide="arrow-right" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
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

    // Ghi nhận vào storage tiến độ học của từ
    if (q.wordItem) {
      window.appStorage.recordWordResult(q.wordItem.id, isCorrect);
    }

    // Hiển thị giải thích chi tiết
    this.showExplanation(q, isCorrect);

    // Hiện nút Tiếp tục
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
            ${isCorrect ? 'Tuyệt vời, chính xác!' : `Chưa đúng rồi! Đáp án: ${q.correctAnswer}`}
          </div>
          ${w ? `
            <p class="text-slate-600 dark:text-slate-300"><span class="font-semibold">${w.word}</span> ${w.phonetic ? `[${w.phonetic}]` : ''}: ${w.meaning}</p>
            ${w.example ? `<p class="text-slate-500 mt-1 italic">"${w.example}"</p>` : ''}
          ` : ''}
        </div>
      </div>
    `;
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

    // Ghi nhận phiên học
    window.appStorage.recordStudySession(this.score, total);

    // Bắn pháo hoa ăn mừng nếu đạt điểm cao
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
          ${percent >= 90 ? 'Xuất sắc tuyệt đối! 🎯' : percent >= 70 ? 'Làm rất tốt! 👏' : 'Tiếp tục cố gắng nhé! 💪'}
        </h2>
        
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Bạn vừa hoàn thành bài trắc nghiệm từ vựng</p>

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

          <button onclick="window.quizCtrl.init(window.appStorage.words, 10)" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-4 h-4"></i>
            <span>Chơi lượt trắc nghiệm mới</span>
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
          <p class="text-slate-500">Cần có ít nhất vài từ vựng để tạo câu hỏi trắc nghiệm.</p>
        </div>
      `;
    }
  }
}

window.quizCtrl = new QuizController();
