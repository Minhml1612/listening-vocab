/**
 * QUIZ / TRẮC NGHIỆM MODE (v3.2 - Bài tập ngữ cảnh Oxford, Nhận diện Collocation Longman & Quay lại câu trước)
 * Tự động phát hiện Collocation Longman (bôi nền tím), cho phép quay lại câu trước & lưu trạng thái câu hỏi
 */

class QuizController {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.furthestIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.wrongAnswers = [];
    this.answered = false;
    this.subMode = 'context'; // 'context' (mặc định 100% ngữ cảnh Oxford) | 'listening' | 'mixed'
    this.activeWordsPool = [];

    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    if (window.appRouter && window.appRouter.currentRoute !== 'quiz') return;
    if (document.querySelector('input:focus, textarea:focus')) return;

    if (e.key === 'ArrowLeft') {
      this.prevQuestion();
    } else if (e.key === 'ArrowRight') {
      const q = this.getCurrentQuestion();
      if (q && q.userAnswer) {
        this.nextQuestion();
      }
    }
  }

  init(words, count = 10, subMode = 'context') {
    if (!words || words.length === 0) {
      this.renderEmpty();
      return;
    }

    this.subMode = subMode || 'context';
    this.activeWordsPool = words.filter(w => w && w.word && w.word.trim().length >= 2);
    this.questions = this.buildQuizSet(this.activeWordsPool, count);
    this.currentIndex = 0;
    this.furthestIndex = 0;
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

  computeStats() {
    let score = 0;
    let runningStreak = 0;
    let maxStreak = 0;
    const wrong = [];

    for (const q of this.questions) {
      if (q && q.userAnswer) {
        if (q.userAnswer.isCorrect) {
          score++;
          runningStreak++;
          if (runningStreak > maxStreak) maxStreak = runningStreak;
        } else {
          runningStreak = 0;
          wrong.push(q);
        }
      }
    }

    this.score = score;
    this.streak = runningStreak;
    this.maxStreak = Math.max(this.maxStreak, maxStreak);
    this.wrongAnswers = wrong;
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderQuestion();
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.furthestIndex = Math.max(this.furthestIndex, this.currentIndex);
      this.renderQuestion();
    } else {
      // Đã tới câu cuối cùng: kiểm tra xem còn câu nào chưa làm không
      const firstUnanswered = this.questions.findIndex(q => !q.userAnswer);
      if (firstUnanswered !== -1) {
        this.currentIndex = firstUnanswered;
        this.renderQuestion();
      } else {
        this.renderSummary();
      }
    }
  }

  goToQuestion(idx) {
    if (idx >= 0 && idx < this.questions.length) {
      if (idx <= this.furthestIndex || (this.questions[idx] && this.questions[idx].userAnswer)) {
        this.currentIndex = idx;
        this.renderQuestion();
      }
    }
  }

  renderQuestionStepper() {
    return `
      <div class="flex items-center gap-2 overflow-x-auto px-2 py-2 mb-2.5 no-scrollbar select-none">
        ${this.questions.map((q, idx) => {
          const isCurrent = idx === this.currentIndex;
          const isAnswered = !!q.userAnswer;
          const isCorrect = isAnswered && q.userAnswer.isCorrect;
          const isWrong = isAnswered && !q.userAnswer.isCorrect;
          const isAccessible = idx <= this.furthestIndex || isAnswered;

          let pillClass = "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative flex-shrink-0 ";
          if (isCurrent) {
            pillClass += " ring-2 ring-[#4255FF] dark:ring-[#7383FF] ring-offset-2 ring-offset-white dark:ring-offset-[#0A092D] font-extrabold ";
          }

          if (isCorrect) {
            pillClass += " bg-emerald-500 text-white shadow-sm cursor-pointer";
          } else if (isWrong) {
            pillClass += " bg-rose-500 text-white shadow-sm cursor-pointer";
          } else if (isCurrent) {
            pillClass += " bg-[#4255FF] text-white";
          } else if (isAccessible) {
            pillClass += " bg-slate-200 dark:bg-slate-700 text-[#2E3856] dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer";
          } else {
            pillClass += " bg-slate-100 dark:bg-slate-800/60 text-slate-300 dark:text-slate-600 opacity-60 cursor-not-allowed";
          }

          return `
            <button type="button" 
                    ${isAccessible ? `onclick="window.quizCtrl.goToQuestion(${idx})"` : 'disabled'}
                    title="Câu ${idx + 1}${isAnswered ? (isCorrect ? ' (Đúng)' : ' (Sai)') : ''}"
                    class="${pillClass}">
              <span>${idx + 1}</span>
              ${isCorrect ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border border-white dark:border-[#1A1D36]"></span>` : ''}
              ${isWrong ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-300 rounded-full border border-white dark:border-[#1A1D36]"></span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  renderOptionsHtml(q, isAnswered) {
    return q.options.map((opt, idx) => {
      let btnClasses = "quiz-option-btn w-full text-left p-3.5 md:p-4 rounded-xl border transition-all font-semibold text-sm md:text-base flex items-center justify-between shadow-sm ";
      let badgeClasses = "w-7 h-7 rounded-full border flex items-center justify-center text-xs option-badge font-semibold ";
      let badgeInner = String.fromCharCode(65 + idx);

      if (isAnswered) {
        const isSelected = q.userAnswer && q.userAnswer.selectedIndex === idx;
        const isThisCorrect = opt.trim() === q.correctAnswer.trim();

        if (isThisCorrect) {
          btnClasses += "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold cursor-default ";
          badgeClasses += "border-emerald-500 text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 ";
          badgeInner = `<i data-lucide="check" class="w-3.5 h-3.5"></i>`;
        } else if (isSelected && !q.userAnswer.isCorrect) {
          btnClasses += "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 cursor-default ";
          badgeClasses += "border-rose-500 text-rose-600 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 ";
          badgeInner = `<i data-lucide="x" class="w-3.5 h-3.5"></i>`;
        } else {
          btnClasses += "bg-white/60 dark:bg-[#1A1D36]/60 border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60 cursor-default ";
          badgeClasses += "border-slate-200 dark:border-slate-700 text-slate-400 ";
        }
      } else {
        btnClasses += "bg-white dark:bg-[#1A1D36] border-[#E5E8EF] dark:border-[#282E4E] hover:border-[#4255FF] dark:hover:border-[#7383FF] hover:bg-blue-50/20 text-[#2E3856] dark:text-white active:scale-[0.99] cursor-pointer ";
        badgeClasses += "border-slate-200 dark:border-slate-700 text-slate-400 ";
      }

      return `
        <button type="button"
          ${isAnswered ? 'disabled' : `onclick="window.quizCtrl.selectOption(${idx}, '${this.escapeHtml(opt)}')"`}
          class="${btnClasses}">
          <span>${this.escapeHtml(opt)}</span>
          <span class="${badgeClasses}">
            ${badgeInner}
          </span>
        </button>
      `;
    }).join('');
  }

  getExplanationHtml(q, isCorrect) {
    const w = q.wordItem;
    return `
      <div class="flex items-start gap-2.5">
        <div class="mt-0.5 p-1 rounded-full ${isCorrect ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300'}">
          <i data-lucide="${isCorrect ? 'check' : 'x'}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 text-xs">
          <div class="font-bold text-[#2E3856] dark:text-white text-sm mb-1">
            ${isCorrect ? 'Chính xác! 🎯' : `Đáp án đúng: <span class="text-emerald-600 dark:text-emerald-400 font-extrabold text-base">${this.escapeHtml(q.correctAnswer)}</span>`}
          </div>

          ${q.fullSentence ? `
            <div class="p-3 bg-slate-50 dark:bg-[#252945] rounded-xl border border-slate-200 dark:border-slate-700 my-2">
              <div class="flex items-center justify-between text-[11px] font-bold text-[#4255FF] dark:text-[#7383FF] mb-1">
                <span>📖 Nguồn: ${this.escapeHtml(q.dictSource || "Oxford Learner's Dictionary")}</span>
                <button type="button" onclick="window.quizCtrl.playFullSentenceAudio()" class="inline-flex items-center gap-1 hover:underline text-[#4255FF] dark:text-[#7383FF]">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Nghe đọc cả câu
                </button>
              </div>
              <p class="text-[#2E3856] dark:text-white font-medium text-xs md:text-sm leading-relaxed mb-1">
                ${this.highlightWord(q.fullSentence, q.correctAnswer)}
              </p>
              ${q.exampleVi ? `<p class="text-slate-500 dark:text-slate-400 italic text-[11px] md:text-xs">💡 ${this.escapeHtml(q.exampleVi)}</p>` : ''}
            </div>
          ` : ''}

          ${w ? `
            <div class="mt-2 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <span class="font-bold text-[#4255FF] dark:text-[#7383FF]">${this.escapeHtml(w.word)}</span> ${w.partOfSpeech ? `<span>(${this.escapeHtml(w.partOfSpeech)})</span>` : ''}: <span class="text-[#2E3856] dark:text-white font-semibold">${this.escapeHtml(w.meaning)}</span>
            </div>
          ` : ''}

          <div class="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onclick="window.appRouter.openOxfordModal('${w ? this.escapeHtml(w.id) : this.escapeHtml(q.correctAnswer || '')}')" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#4255FF] dark:text-[#7383FF] hover:underline">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>Mở từ điển Oxford chi tiết ngay tại đây</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderActionBarHtml(isAnswered) {
    const isLast = this.currentIndex === this.questions.length - 1;
    const canGoPrev = this.currentIndex > 0;

    if (isAnswered) {
      return `
        <div id="quiz-action-bar" class="pt-4 flex items-center gap-2.5">
          ${canGoPrev ? `
            <button type="button" onclick="window.quizCtrl.prevQuestion()" class="py-3 px-4 sm:px-5 bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] dark:hover:bg-[#2e3357] text-[#2E3856] dark:text-white font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm text-sm border border-slate-200/80 dark:border-slate-700/80">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Câu trước</span>
            </button>
          ` : ''}
          <button type="button" onclick="window.quizCtrl.nextQuestion()" class="flex-1 py-3 px-4 bg-[#4255FF] hover:bg-[#3644D9] text-white font-bold rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-sm">
            <span>${isLast ? 'Xem kết quả' : 'Tiếp tục câu sau'}</span>
            <i data-lucide="${isLast ? 'award' : 'arrow-right'}" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    } else {
      return `
        <div id="quiz-action-bar" class="pt-4 flex items-center justify-between">
          ${canGoPrev ? `
            <button type="button" onclick="window.quizCtrl.prevQuestion()" class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-[#252945] dark:hover:bg-[#2e3357] text-[#586380] dark:text-[#939BB4] hover:text-[#2E3856] dark:hover:text-white font-semibold rounded-xl active:scale-98 transition-all flex items-center gap-1.5 text-xs border border-slate-200/70 dark:border-slate-700/70">
              <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
              <span>Quay lại câu trước</span>
            </button>
          ` : '<div></div>'}
          <span class="text-[11px] text-slate-400 italic">Chọn 1 đáp án để tiếp tục</span>
        </div>
      `;
    }
  }

  renderQuestion() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    const q = this.getCurrentQuestion();
    if (!q) {
      this.renderSummary();
      return;
    }

    this.furthestIndex = Math.max(this.furthestIndex, this.currentIndex);
    const isAnswered = !!q.userAnswer;
    this.answered = isAnswered;

    const answeredCount = this.questions.filter(item => !!item.userAnswer).length;
    const progressPercent = Math.round((answeredCount / this.questions.length) * 100);

    container.innerHTML = `
      <div class="max-w-3xl lg:max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-140px)] md:min-h-0 justify-between pb-4">
        <div>
          <!-- Header: Điều hướng, Tiến độ & Điểm -->
          <div class="flex items-center justify-between text-xs font-semibold text-[#586380] dark:text-[#939BB4] mb-2 px-1">
            <div class="flex items-center gap-2">
              ${this.currentIndex > 0 ? `
                <button type="button" onclick="window.quizCtrl.prevQuestion()" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2E3856] dark:text-white transition-all active:scale-95 font-semibold text-xs border border-slate-200/80 dark:border-slate-700/80">
                  <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
                  <span>Câu trước</span>
                </button>
              ` : ''}
              <span class="font-bold text-[#2E3856] dark:text-white text-xs sm:text-sm">Câu ${this.currentIndex + 1} / ${this.questions.length}</span>
            </div>
            <div class="flex items-center gap-2.5 sm:gap-3">
              <div id="quiz-streak-container">
                ${this.streak > 1 ? `
                  <span class="inline-flex items-center gap-1 text-amber-500 font-bold animate-pulse">
                    🔥 ${this.streak} chuỗi
                  </span>
                ` : ''}
              </div>
              <span id="quiz-score-badge" class="text-[#4255FF] dark:text-[#7383FF] font-bold">Điểm: ${this.score}</span>
            </div>
          </div>

          <!-- Thanh tiến trình câu hỏi -->
          <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
            <div id="quiz-progress-bar" class="bg-[#4255FF] h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
          </div>

          <!-- Danh sách nút nhảy câu hỏi (Question Stepper) -->
          <div id="quiz-stepper-container">
            ${this.renderQuestionStepper()}
          </div>

          <!-- Khung câu hỏi ngữ cảnh Oxford -->
          <div class="bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] rounded-2xl p-4 md:p-5 shadow-sm mb-3.5">
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-xs font-bold uppercase tracking-wider text-[#4255FF] dark:text-[#7383FF] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                <span>Bài tập ngữ cảnh Oxford</span>
              </span>
              <span class="text-xs text-slate-400">
                ${isAnswered ? (q.userAnswer.isCorrect ? '<span class="text-emerald-500 font-bold">✓ Đã trả lời đúng</span>' : '<span class="text-rose-500 font-bold">✕ Đã trả lời sai</span>') : 'Điền từ vào chỗ trống'}
              </span>
            </div>

            <div class="py-1">
              <div onclick="window.quizCtrl.handlePromptClick(event)" class="p-4 bg-slate-50 dark:bg-[#252945] rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-1">
                <p class="text-base md:text-lg font-medium text-[#2E3856] dark:text-white leading-relaxed font-sans">
                  ${this.formatInteractivePrompt(q.prompt)}
                </p>
                <div class="text-[11px] text-[#4255FF] dark:text-[#7383FF] mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2 font-semibold select-none">
                  <div class="flex items-center gap-1.5">
                    <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                    <span>Chạm vào từ đơn để tra nghĩa</span>
                  </div>
                  <div class="flex items-center gap-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                    <span class="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                    <span>Nền tím = Cụm Collocation (Longman)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4 Lựa chọn A, B, C, D -->
          <div id="quiz-options" class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            ${this.renderOptionsHtml(q, isAnswered)}
          </div>

          <!-- Khung giải thích -->
          <div id="quiz-explanation" class="${isAnswered ? '' : 'hidden'} mt-3 p-4 rounded-xl bg-white dark:bg-[#1A1D36] border border-[#E5E8EF] dark:border-[#282E4E] shadow-sm">
            ${isAnswered ? this.getExplanationHtml(q, q.userAnswer.isCorrect) : ''}
          </div>
        </div>

        <!-- Thanh điều hướng dưới cùng (Câu trước / Tiếp tục) -->
        <div id="quiz-action-container">
          ${this.renderActionBarHtml(isAnswered)}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  handlePromptClick(event) {
    const collocTarget = event.target.closest('.clickable-collocation');
    if (collocTarget) {
      event.stopPropagation();
      const phrase = collocTarget.dataset.collocation;
      const q = this.getCurrentQuestion();
      const prompt = q ? q.prompt : '';
      if (phrase && window.appRouter && typeof window.appRouter.lookupContextWord === 'function') {
        window.appRouter.lookupContextWord(phrase, prompt, { isCollocation: true, dictSource: "Longman Collocations Dictionary" });
      }
      return;
    }

    const target = event.target.closest('.clickable-word');
    if (!target) return;
    event.stopPropagation();
    const word = target.dataset.word;
    const q = this.getCurrentQuestion();
    const prompt = q ? q.prompt : '';
    if (word && window.appRouter && typeof window.appRouter.lookupContextWord === 'function') {
      window.appRouter.lookupContextWord(word, prompt);
    }
  }

  formatInteractivePrompt(prompt) {
    if (!prompt) return '';
    const blankHtml = `<span class="inline-block text-[#4255FF] dark:text-[#7383FF] font-bold text-sm md:text-base mx-1 border-b-2 border-[#4255FF]/50 pb-0.5 tracking-widest select-none">........</span>`;

    // Chuẩn hóa dấu ba chấm / gạch dưới thành token đặc biệt
    let withMarker = prompt.replace(/(\.{3,}|_{3,})/g, '___BLANK_TOKEN___');

    // 1. Nhận diện Collocation nếu có module Longman Collocation
    const collocations = (window.appCollocations && typeof window.appCollocations.detectCollocations === 'function')
      ? window.appCollocations.detectCollocations(withMarker)
      : [];

    let processedHtml = '';
    let lastIndex = 0;

    // Helper tạo thẻ từ vựng bấm được
    const wrapWords = (text) => {
      return text.replace(/\b([a-zA-Z][a-zA-Z'-]*)\b/g, (match) => {
        if (match === '___BLANK_TOKEN___') return match;
        const cleanWord = match.replace(/[^a-zA-Z]/g, '');
        if (cleanWord.length < 2) return match;
        return `<span class="clickable-word" data-word="${this.escapeHtml(cleanWord)}" title="Chạm để tra nghĩa '${this.escapeHtml(cleanWord)}'">${match}</span>`;
      });
    };

    if (collocations.length > 0) {
      for (const col of collocations) {
        // Bỏ qua nếu collocation chứa token chỗ trống
        if (withMarker.slice(col.start, col.end).includes('___BLANK_TOKEN___')) continue;

        // Xử lý đoạn text trước collocation
        if (col.start > lastIndex) {
          const beforeText = withMarker.substring(lastIndex, col.start);
          processedHtml += wrapWords(beforeText);
        }

        // Bọc Collocation trong nền màu tím đặc trưng theo yêu cầu (loại bỏ nhãn chữ colloc để câu đọc tự nhiên, gọn gàng)
        processedHtml += `<span class="clickable-collocation inline-block px-2 py-0.5 mx-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/80 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700/80 font-bold transition-all cursor-pointer shadow-sm active:scale-95" data-collocation="${this.escapeHtml(col.phrase)}" title="Collocation (Longman): ${this.escapeHtml(col.phrase)} • Chạm để tra nghĩa & lưu">${this.escapeHtml(col.matchedText)}</span>`;

        lastIndex = col.end;
      }

      // Xử lý đoạn text còn lại sau collocation cuối cùng
      if (lastIndex < withMarker.length) {
        const remaining = withMarker.substring(lastIndex);
        processedHtml += wrapWords(remaining);
      }
    } else {
      processedHtml = wrapWords(withMarker);
    }

    return processedHtml.replace(/___BLANK_TOKEN___/g, blankHtml);
  }

  formatPromptWithBlank(prompt) {
    return this.formatInteractivePrompt(prompt);
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
    const q = this.getCurrentQuestion();
    if (!q || this.answered || q.userAnswer) return;

    this.answered = true;
    const isCorrect = selectedText.trim() === q.correctAnswer.trim();

    // Lưu trạng thái câu trả lời vào câu hỏi
    q.userAnswer = {
      selectedIndex,
      selectedText,
      isCorrect,
      answeredAt: Date.now()
    };

    // Cập nhật điểm & chuỗi
    this.computeStats();

    // Âm thanh
    if (isCorrect) {
      window.appAudio.playCorrect();
    } else {
      window.appAudio.playIncorrect();
    }

    if (q.wordItem) {
      window.appStorage.recordWordResult(q.wordItem.id, isCorrect);
    }

    // 1. Cập nhật các nút lựa chọn
    const optionsContainer = document.getElementById('quiz-options');
    if (optionsContainer) {
      optionsContainer.innerHTML = this.renderOptionsHtml(q, true);
    }

    // 2. Hiển thị khung giải thích
    const expBox = document.getElementById('quiz-explanation');
    if (expBox) {
      expBox.classList.remove('hidden');
      expBox.innerHTML = this.getExplanationHtml(q, isCorrect);
    }

    // 3. Cập nhật thanh điều hướng
    const actionContainer = document.getElementById('quiz-action-container');
    if (actionContainer) {
      actionContainer.innerHTML = this.renderActionBarHtml(true);
    }

    // 4. Cập nhật header & stepper
    this.updateHeaderAndProgress();

    if (window.lucide) window.lucide.createIcons();
  }

  updateHeaderAndProgress() {
    const answeredCount = this.questions.filter(item => !!item.userAnswer).length;
    const progressPercent = Math.round((answeredCount / this.questions.length) * 100);

    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;

    const scoreEl = document.getElementById('quiz-score-badge');
    if (scoreEl) scoreEl.innerText = `Điểm: ${this.score}`;

    const streakContainer = document.getElementById('quiz-streak-container');
    if (streakContainer) {
      if (this.streak > 1) {
        streakContainer.innerHTML = `
          <span class="inline-flex items-center gap-1 text-amber-500 font-bold animate-pulse">
            🔥 ${this.streak} chuỗi
          </span>
        `;
      } else {
        streakContainer.innerHTML = '';
      }
    }

    const stepperEl = document.getElementById('quiz-stepper-container');
    if (stepperEl) {
      stepperEl.innerHTML = this.renderQuestionStepper();
    }
  }

  showExplanation(q, isCorrect) {
    const expBox = document.getElementById('quiz-explanation');
    if (!expBox) return;
    expBox.classList.remove('hidden');
    expBox.innerHTML = this.getExplanationHtml(q, isCorrect);
    if (window.lucide) window.lucide.createIcons();
  }

  renderSummary() {
    const container = document.getElementById('mode-content');
    if (!container) return;

    this.computeStats();
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
    this.questions = this.wrongAnswers.map(q => {
      const copy = { ...q };
      delete copy.userAnswer;
      return copy;
    });
    this.currentIndex = 0;
    this.furthestIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.wrongAnswers = [];
    this.answered = false;
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
