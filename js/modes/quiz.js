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
          <!-- Header: Tiến độ & Chuỗi câu đúng -->
          <div class="flex items-center justify-between text-xs font-mono text-[#736D64] dark:text-[#9E968D] mb-2 px-1">
            <span>&gt; question ${this.currentIndex + 1} / ${this.questions.length}</span>
            <div class="flex items-center gap-3">
              ${this.streak > 1 ? `
                <span class="inline-flex items-center gap-1 text-[#F59E0B] font-bold animate-pulse">
                  🔥 ${this.streak} streak
                </span>
              ` : ''}
              <span class="text-[#D97757] font-bold">score: ${this.score}</span>
            </div>
          </div>
          
          <div class="w-full bg-[#E6E1D8] dark:bg-[#292522] h-1.5 rounded-full overflow-hidden mb-3.5">
            <div class="bg-[#D97757] h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
          </div>

          <!-- KHUNG CÂU HỎI NGỮ CẢNH CHUẨN OXFORD & LONGMAN -->
          <div class="bg-white dark:bg-[#1E1C1A] border border-[#E6E1D8] dark:border-[#332E2A] rounded-2xl p-4 md:p-5 shadow-sm mb-3.5">
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E1D8]/60 dark:border-[#292522]">
              <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D97757] bg-[#D97757]/10 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                <i data-lucide="terminal" class="w-3.5 h-3.5"></i>
                <span>oxford-cloze-challenge</span>
              </span>
              <span class="text-[11px] font-mono text-[#736D64] dark:text-[#9E968D]">fill-in-the-blank</span>
            </div>

            <div class="py-1">
              <p class="text-xs font-mono uppercase tracking-wider text-[#736D64] dark:text-[#9E968D] mb-2">
                Chọn từ thích hợp nhất điền vào chỗ trống:
              </p>
              <!-- Câu ngữ cảnh có ô trống (....) -->
              <div class="p-4 md:p-5 bg-[#FAF8F5] dark:bg-[#141312] rounded-xl border border-[#E6E1D8] dark:border-[#292522] mb-1">
                <p class="text-base md:text-lg font-medium text-[#1E1D1B] dark:text-[#EDE8E3] leading-relaxed font-sans">
                  ${this.formatPromptWithBlank(q.prompt)}
                </p>
              </div>
            </div>
          </div>

          <!-- Danh sách 4 Lựa chọn A, B, C, D -->
          <div id="quiz-options" class="space-y-2">
            ${q.options.map((opt, idx) => `
              <button onclick="window.quizCtrl.selectOption(${idx}, '${this.escapeHtml(opt)}')" class="quiz-option-btn w-full text-left p-3.5 md:p-4 rounded-xl border border-[#E6E1D8] dark:border-[#332E2A] bg-white dark:bg-[#1E1C1A] hover:border-[#D97757] transition-all font-semibold text-[#1E1D1B] dark:text-[#EDE8E3] text-sm md:text-base flex items-center justify-between active:scale-[0.99] shadow-sm group">
                <span class="font-sans">${opt}</span>
                <span class="w-6 h-6 rounded-md border border-[#E6E1D8] dark:border-[#332E2A] bg-black/5 dark:bg-white/5 flex items-center justify-center text-xs text-[#736D64] dark:text-[#9E968D] option-badge font-mono group-hover:border-[#D97757]/60 group-hover:text-[#D97757]">
                  ${String.fromCharCode(65 + idx)}
                </span>
              </button>
            `).join('')}
          </div>

          <!-- Khung giải thích chi tiết & Câu hoàn chỉnh -->
          <div id="quiz-explanation" class="hidden mt-3 p-4 rounded-xl bg-white dark:bg-[#1E1C1A] border border-[#E6E1D8] dark:border-[#332E2A] shadow-sm">
          </div>
        </div>

        <!-- Nút Tiếp tục -->
        <div id="quiz-next-container" class="hidden pt-4">
          <button onclick="window.quizCtrl.nextQuestion()" class="w-full py-3.5 bg-[#D97757] hover:bg-[#E2856A] text-white font-mono font-bold rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2">
            <span>$ next_question -&gt;</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  formatPromptWithBlank(prompt) {
    if (!prompt) return '';
    return prompt.replace(/(\.{3,}|_{3,})/g, `<span class="inline-flex items-center px-3 py-0.5 rounded-md bg-[#D97757]/15 text-[#D97757] border-2 border-dashed border-[#D97757] font-mono font-bold text-sm md:text-base mx-1.5 shadow-sm">........</span>`);
  }

  highlightWord(sentence, targetWord) {
    if (!sentence || !targetWord) return sentence || '';
    const clean = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${clean})\\b`, 'gi');
    return sentence.replace(regex, `<span class="bg-[#10B981]/20 text-[#10B981] font-bold px-1.5 py-0.5 rounded border border-[#10B981]/40 font-mono">$1</span>`);
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
        btn.classList.remove('bg-white', 'dark:bg-[#1E1C1A]', 'border-[#E6E1D8]', 'dark:border-[#332E2A]');
        btn.classList.add('bg-[#10B981]/15', 'border-[#10B981]', 'text-[#10B981]', 'font-bold');
        if (badge) {
          badge.classList.add('border-[#10B981]', 'text-[#10B981]', 'bg-[#10B981]/20');
          badge.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i>`;
        }
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.remove('bg-white', 'dark:bg-[#1E1C1A]', 'border-[#E6E1D8]', 'dark:border-[#332E2A]');
        btn.classList.add('bg-[#EF4444]/15', 'border-[#EF4444]', 'text-[#EF4444]', 'shake-it');
        if (badge) {
          badge.classList.add('border-[#EF4444]', 'text-[#EF4444]', 'bg-[#EF4444]/20');
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
        <div class="mt-0.5 p-1 rounded-md ${isCorrect ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'}">
          <i data-lucide="${isCorrect ? 'check' : 'x'}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 text-xs">
          <div class="font-bold text-[#1E1D1B] dark:text-[#EDE8E3] text-sm mb-1 font-mono">
            ${isCorrect ? 'Chính xác! 🎯' : `Đáp án đúng: <span class="text-[#10B981] font-extrabold text-base">${q.correctAnswer}</span>`}
          </div>

          ${q.fullSentence ? `
            <div class="p-3 bg-[#FAF8F5] dark:bg-[#141312] rounded-xl border border-[#E6E1D8] dark:border-[#292522] my-2">
              <div class="flex items-center justify-between text-[11px] font-mono text-[#D97757] mb-1">
                <span>📖 Nguồn: ${q.dictSource || "Oxford Learner's Dictionary"}</span>
                <button type="button" onclick="window.quizCtrl.playFullSentenceAudio()" class="inline-flex items-center gap-1 hover:underline text-[#D97757]">
                  <i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Nghe đọc cả câu
                </button>
              </div>
              <p class="text-[#1E1D1B] dark:text-[#EDE8E3] font-medium text-xs md:text-sm leading-relaxed mb-1">
                ${this.highlightWord(q.fullSentence, q.correctAnswer)}
              </p>
              ${q.exampleVi ? `<p class="text-[#736D64] dark:text-[#9E968D] italic text-[11px] md:text-xs">💡 ${q.exampleVi}</p>` : ''}
            </div>
          ` : ''}

          ${w ? `
            <div class="mt-2 text-[#736D64] dark:text-[#9E968D] text-xs font-medium">
              <span class="font-bold text-[#D97757] font-mono">${w.word}</span> ${w.partOfSpeech ? `<span class="font-mono">(${w.partOfSpeech})</span>` : ''}: <span class="text-[#1E1D1B] dark:text-[#EDE8E3]">${w.meaning}</span>
            </div>
          ` : ''}

          <div class="mt-2.5 pt-2 border-t border-[#E6E1D8]/60 dark:border-[#292522]">
            <a href="https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent((w ? w.word : q.correctAnswer).toLowerCase().trim().replace(/\s+/g, '-'))}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#D97757] hover:underline">
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
        <div class="w-16 h-16 rounded-2xl ${percent >= 70 ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'} flex items-center justify-center mx-auto mb-4 shadow-sm">
          <i data-lucide="${percent >= 70 ? 'check-circle' : 'award'}" class="w-8 h-8"></i>
        </div>

        <h2 class="text-xl md:text-2xl font-bold font-sans text-[#1E1D1B] dark:text-[#EDE8E3]">
          ${percent >= 90 ? 'Xuất sắc tuyệt đối! 🎯' : percent >= 70 ? 'Luyện ngữ cảnh rất tốt! 👏' : 'Tiếp tục rèn luyện nhé! 💪'}
        </h2>
        
        <p class="text-xs font-mono text-[#736D64] dark:text-[#9E968D] mt-1">$ session_complete: 10 oxford sentences verified</p>

        <!-- Thẻ điểm -->
        <div class="grid grid-cols-3 gap-2 my-5">
          <div class="p-3 bg-white dark:bg-[#1E1C1A] rounded-xl border border-[#E6E1D8] dark:border-[#332E2A]">
            <div class="text-xl md:text-2xl font-mono font-bold text-[#D97757]">${this.score}/${total}</div>
            <div class="text-[10px] font-mono uppercase text-[#736D64] dark:text-[#9E968D] mt-0.5">Số câu đúng</div>
          </div>
          <div class="p-3 bg-white dark:bg-[#1E1C1A] rounded-xl border border-[#E6E1D8] dark:border-[#332E2A]">
            <div class="text-xl md:text-2xl font-mono font-bold text-[#10B981]">${percent}%</div>
            <div class="text-[10px] font-mono uppercase text-[#736D64] dark:text-[#9E968D] mt-0.5">Chính xác</div>
          </div>
          <div class="p-3 bg-white dark:bg-[#1E1C1A] rounded-xl border border-[#E6E1D8] dark:border-[#332E2A]">
            <div class="text-xl md:text-2xl font-mono font-bold text-[#F59E0B]">🔥 ${this.maxStreak}</div>
            <div class="text-[10px] font-mono uppercase text-[#736D64] dark:text-[#9E968D] mt-0.5">Chuỗi max</div>
          </div>
        </div>

        <!-- Các nút bấm -->
        <div class="space-y-2">
          ${this.wrongAnswers.length > 0 ? `
            <button onclick="window.quizCtrl.retryWrongAnswers()" class="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-mono font-bold rounded-xl shadow-sm flex items-center justify-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>$ retry-mistakes (${this.wrongAnswers.length})</span>
            </button>
          ` : ''}

          <button onclick="window.quizCtrl.init(window.appStorage.words, 10, '${this.subMode}')" class="w-full py-3.5 bg-[#D97757] hover:bg-[#E2856A] text-white font-mono font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
            <i data-lucide="play" class="w-4 h-4"></i>
            <span>$ next-10-oxford-questions</span>
          </button>

          <button onclick="window.appRouter.navigate('flashcard')" class="w-full py-2.5 bg-black/5 dark:bg-white/5 border border-[#E6E1D8] dark:border-[#332E2A] text-[#1E1D1B] dark:text-[#EDE8E3] font-mono text-xs rounded-xl flex items-center justify-center gap-2">
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>$ switch-to-flashcard</span>
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
