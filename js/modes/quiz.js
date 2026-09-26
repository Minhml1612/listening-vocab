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

  init(words, count = 10) {
    if (!words || words.length === 0) {
      this.renderEmpty();
      return;
    }

    this.activeWordsPool = words.filter(w => w && w.word && w.word.trim().length >= 2);
    this.questions = this.buildQuizSet(this.activeWordsPool, count);
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.wrongAnswers = [];
    this.answered = false;

    this.renderQuestion();
  }

  buildQuizSet(words, count = 10) {
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
        allQuestions.push(generated[0]);
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

    container.innerHTML = `
      <div class="max-w-md mx-auto flex flex-col min-h-[calc(100vh-140px)] md:min-h-[580px] justify-between pb-4">
        <div>
          <!-- Header: Tiến độ & Điểm -->
          <div class="flex items-center justify-between text-xs font-semibold text-[#586380] dark:text-[#939BB4] mb-2 px-1">
            <span>Câu ${this.currentIndex + 1} / ${this.questions.length}</span>
            <div class="flex items-center gap-3">
              ${this.streak > 1 ? `
                <span class="inline-flex items-center gap-1 text-amber-500 font-bold animate-pulse">
                  🔥 ${this.streak} chuỗi
                </span>
              ` : ''}
              <span class="text-[#4255FF] font-bold">Điểm: ${this.score}</span>
            </div>
          </div>
          
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
            <div class="bg-[#4255FF] h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
          </div>

          <!-- Khung câu hỏi ngữ cảnh Oxford -->
          <div class="bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] rounded-2xl p-4 md:p-5 shadow-sm mb-3.5">
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-xs font-bold uppercase tracking-wider text-[#4255FF] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                <span>Bài tập ngữ cảnh Oxford</span>
              </span>
              <span class="text-xs text-slate-400">Điền từ vào chỗ trống</span>
            </div>

            <div class="py-1">
              <div class="p-4 bg-slate-50 dark:bg-[#252945] rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-1">
                <p class="text-base md:text-lg font-medium text-[#2E3856] dark:text-white leading-relaxed font-sans">
                  ${this.formatPromptWithBlank(q.prompt)}
                </p>
              </div>
            </div>
          </div>

          <!-- 4 Lựa chọn A, B, C, D -->
          <div id="quiz-options" class="space-y-2.5">
            ${q.options.map((opt, idx) => `
              <button onclick="window.quizCtrl.selectOption(${idx}, '${this.escapeHtml(opt)}')" class="quiz-option-btn w-full text-left p-3.5 md:p-4 rounded-xl border border-[#E5E8EF] dark:border-[#282E4E] bg-white dark:bg-[#1A1D36] hover:border-[#4255FF] transition-all font-semibold text-[#2E3856] dark:text-white text-sm md:text-base flex items-center justify-between active:scale-[0.99] shadow-sm">
                <span>${opt}</span>
                <span class="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400 option-badge font-semibold">
                  ${String.fromCharCode(65 + idx)}
                </span>
              </button>
            `).join('')}
          </div>

          <!-- Khung giải thích -->
          <div id="quiz-explanation" class="hidden mt-3 p-4 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] shadow-sm">
          </div>
        </div>

        <!-- Nút Tiếp tục -->
        <div id="quiz-next-container" class="hidden pt-4">
          <button onclick="window.quizCtrl.nextQuestion()" class="w-full py-3.5 bg-[#4255FF] hover:bg-[#3644D9] text-white font-bold rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2">
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
    return prompt.replace(/(\.{3,}|_{3,})/g, `<span class="inline-flex items-center px-3 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-[#4255FF] border-2 border-dashed border-[#4255FF] font-bold text-sm md:text-base mx-1.5 shadow-sm">........</span>`);
  }

  highlightWord(sentence, targetWord) {
    if (!sentence || !targetWord) return sentence || '';
    const clean = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${clean})\\b`, 'gi');
    return sentence.replace(regex, `<span class="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-400/60">$1</span>`);
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
        btn.classList.remove('bg-white', 'dark:bg-[#1A1D36]', 'border-[#E5E8EF]', 'dark:border-[#282E4E]');
        btn.classList.add('bg-emerald-50', 'dark:bg-emerald-950/60', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300', 'font-bold');
        if (badge) {
          badge.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-100');
          badge.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i>`;
        }
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.remove('bg-white', 'dark:bg-[#1A1D36]', 'border-[#E5E8EF]', 'dark:border-[#282E4E]');
        btn.classList.add('bg-rose-50', 'dark:bg-rose-950/60', 'border-rose-500', 'text-rose-700', 'dark:text-rose-300', 'shake-it');
        if (badge) {
          badge.classList.add('border-rose-500', 'text-rose-600', 'bg-rose-100');
          badge.innerHTML = `<i data-lucide="x" class="w-3.5 h-3.5"></i>`;
        }
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
        <div class="mt-0.5 p-1 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">
          <i data-lucide="${isCorrect ? 'check' : 'x'}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 text-xs">
          <div class="font-bold text-[#2E3856] dark:text-white text-sm mb-1">
            ${isCorrect ? 'Chính xác! 🎯' : `Đáp án đúng: <span class="text-emerald-600 dark:text-emerald-400 font-extrabold text-base">${q.correctAnswer}</span>`}
          </div>

          ${q.fullSentence ? `
            <div class="p-3 bg-slate-50 dark:bg-[#252945] rounded-xl border border-slate-200 dark:border-slate-700 my-2">
              <div class="flex items-center justify-between text-[11px] font-bold text-[#4255FF] mb-1">
                <span>📖 Nguồn: ${q.dictSource || "Oxford Learner's Dictionary"}</span>
                <button type="button" onclick="window.quizCtrl.playFullSentenceAudio()" class="inline-flex items-center gap-1 hover:underline text-[#4255FF]">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Nghe đọc cả câu
                </button>
              </div>
              <p class="text-[#2E3856] dark:text-white font-medium text-xs md:text-sm leading-relaxed mb-1">
                ${this.highlightWord(q.fullSentence, q.correctAnswer)}
              </p>
              ${q.exampleVi ? `<p class="text-slate-500 dark:text-slate-400 italic text-[11px] md:text-xs">💡 ${q.exampleVi}</p>` : ''}
            </div>
          ` : ''}

          ${w ? `
            <div class="mt-2 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <span class="font-bold text-[#4255FF]">${w.word}</span> ${w.partOfSpeech ? `<span>(${w.partOfSpeech})</span>` : ''}: <span class="text-[#2E3856] dark:text-white">${w.meaning}</span>
            </div>
          ` : ''}

          <div class="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
            <a href="https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent((w ? w.word : q.correctAnswer).toLowerCase().trim().replace(/\s+/g, '-'))}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-[#4255FF] hover:underline">
              <span>↗ Tra từ này trên Oxford Learner's Dictionaries</span>
            </a>
          </div>
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
        <div class="w-16 h-16 rounded-2xl ${percent >= 70 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'} flex items-center justify-center mx-auto mb-4 shadow-sm">
          <i data-lucide="${percent >= 70 ? 'trophy' : 'award'}" class="w-8 h-8"></i>
        </div>

        <h2 class="text-xl md:text-2xl font-bold font-sans text-[#2E3856] dark:text-white">
          ${percent >= 90 ? 'Xuất sắc tuyệt đối! 🎯' : percent >= 70 ? 'Luyện ngữ cảnh rất tốt! 👏' : 'Tiếp tục rèn luyện nhé! 💪'}
        </h2>
        
        <p class="text-xs text-[#586380] dark:text-[#939BB4] mt-1">Bạn vừa hoàn thành 10 câu bài tập ngữ cảnh Oxford</p>

        <!-- Thẻ điểm -->
        <div class="grid grid-cols-3 gap-2.5 my-5">
          <div class="p-3 bg-white dark:bg-[#1A1D36] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] shadow-sm">
            <div class="text-xl md:text-2xl font-black text-[#4255FF]">${this.score}/${total}</div>
            <div class="text-[11px] font-bold text-[#586380] dark:text-[#939BB4] uppercase mt-0.5">Số câu đúng</div>
          </div>
          <div class="p-3 bg-white dark:bg-[#1A1D36] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] shadow-sm">
            <div class="text-xl md:text-2xl font-black text-[#23B26D]">${percent}%</div>
            <div class="text-[11px] font-bold text-[#586380] dark:text-[#939BB4] uppercase mt-0.5">Chính xác</div>
          </div>
          <div class="p-3 bg-white dark:bg-[#1A1D36] rounded-2xl border border-[#E5E8EF] dark:border-[#282E4E] shadow-sm">
            <div class="text-xl md:text-2xl font-black text-[#FFCD1F]">🔥 ${this.maxStreak}</div>
            <div class="text-[11px] font-bold text-[#586380] dark:text-[#939BB4] uppercase mt-0.5">Chuỗi cao nhất</div>
          </div>
        </div>

        <!-- Các nút bấm -->
        <div class="space-y-2.5">
          ${this.wrongAnswers.length > 0 ? `
            <button onclick="window.quizCtrl.retryWrongAnswers()" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Luyện lại ${this.wrongAnswers.length} câu làm sai</span>
            </button>
          ` : ''}

          <button onclick="window.quizCtrl.init(window.appStorage.words, 10, '${this.subMode}')" class="w-full py-3.5 bg-[#4255FF] hover:bg-[#3644D9] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-4 h-4"></i>
            <span>Làm tiếp 10 câu mới</span>
          </button>

          <button onclick="window.appRouter.navigate('flashcard')" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] text-[#2E3856] dark:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2">
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
