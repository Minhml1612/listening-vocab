/**
 * AI & DICTIONARY ENRICHMENT ENGINE
 * Tự động tra cứu phát âm IPA, nghĩa tiếng Việt, định nghĩa Anh - Anh,
 * câu ví dụ ngữ cảnh và tạo bộ câu hỏi trắc nghiệm tự động.
 */

class WordEnricher {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Tự động làm giàu thông tin cho một từ vựng
   */
  async enrich(wordItem, apiKey = '') {
    const rawWord = (wordItem.word || '').trim();
    if (!rawWord) return wordItem;

    const enriched = { ...wordItem };

    // 1. Nếu có Google Gemini API Key: Gọi AI để làm giàu toàn diện và dịch ngữ cảnh
    if (apiKey) {
      try {
        const aiResult = await this.fetchFromGemini(rawWord, apiKey);
        if (aiResult) {
          if (!enriched.meaning || enriched.meaning === 'Đang cập nhật...') {
            enriched.meaning = aiResult.meaning || enriched.meaning;
          }
          enriched.phonetic = aiResult.phonetic || enriched.phonetic;
          enriched.partOfSpeech = aiResult.partOfSpeech || enriched.partOfSpeech;
          enriched.definition = aiResult.definition || enriched.definition;
          enriched.example = aiResult.example || enriched.example;
          enriched.exampleVi = aiResult.exampleVi || enriched.exampleVi;
          if (aiResult.audioUrl && !enriched.audioUrl) {
            enriched.audioUrl = aiResult.audioUrl;
          }
          return enriched;
        }
      } catch (err) {
        console.warn('Gemini API enrichment failed, falling back to free dictionary:', err);
      }
    }

    // 2. Tra cứu từ điển chuẩn Free Dictionary API (IPA, Audio người thật, Định nghĩa, Ví dụ)
    try {
      const dictData = await this.fetchFreeDictionary(rawWord);
      if (dictData) {
        if (!enriched.phonetic && dictData.phonetic) enriched.phonetic = dictData.phonetic;
        if (!enriched.audioUrl && dictData.audioUrl) enriched.audioUrl = dictData.audioUrl;
        if (!enriched.partOfSpeech && dictData.partOfSpeech) enriched.partOfSpeech = dictData.partOfSpeech;
        if (!enriched.definition && dictData.definition) enriched.definition = dictData.definition;
        if (!enriched.example && dictData.example) enriched.example = dictData.example;
      }
    } catch (e) {
      console.warn('Free Dictionary API lookup error:', e);
    }

    // 3. Nếu chưa có nghĩa tiếng Việt hoặc nghĩa rỗng, tự động dịch bằng MyMemory API miễn phí
    if (!enriched.meaning || enriched.meaning === 'Đang cập nhật...') {
      try {
        const viMeaning = await this.translateToVietnamese(rawWord);
        if (viMeaning) {
          enriched.meaning = viMeaning;
        }
      } catch (e) {
        console.warn('Translation error:', e);
      }
    }

    // 4. Nếu chưa có câu ví dụ ngữ cảnh, tạo câu ví dụ tự nhiên phù hợp với bài thi Listening
    if (!enriched.example) {
      enriched.example = this.generateFallbackExample(rawWord, enriched.partOfSpeech);
    }

    return enriched;
  }

  /**
   * Tra cứu Free Dictionary API
   */
  async fetchFreeDictionary(word) {
    const cleanWord = word.toLowerCase().replace(/[^a-z-]/g, '');
    if (!cleanWord) return null;

    try {
      const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const entry = data[0];
      let phonetic = entry.phonetic || '';
      let audioUrl = '';

      if (Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (!phonetic && p.text) phonetic = p.text;
          if (p.audio && p.audio.endsWith('.mp3')) {
            audioUrl = p.audio;
            if (audioUrl.includes('-us.mp3') || audioUrl.includes('-uk.mp3')) break;
          }
        }
      }

      let partOfSpeech = '';
      let definition = '';
      let example = '';

      if (Array.isArray(entry.meanings) && entry.meanings.length > 0) {
        const m = entry.meanings[0];
        partOfSpeech = m.partOfSpeech || '';
        if (Array.isArray(m.definitions) && m.definitions.length > 0) {
          const d = m.definitions[0];
          definition = d.definition || '';
          example = d.example || '';
        }
      }

      return { phonetic, audioUrl, partOfSpeech, definition, example };
    } catch (e) {
      return null;
    }
  }

  /**
   * Dịch từ sang Tiếng Việt bằng MyMemory API miễn phí
   */
  async translateToVietnamese(word) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const json = await resp.json();
      if (json && json.responseData && json.responseData.translatedText) {
        let text = json.responseData.translatedText.trim();
        // Lọc kết quả nếu trùng với từ gốc
        if (text.toLowerCase() === word.toLowerCase()) return null;
        return text.toLowerCase();
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Tích hợp Google Gemini AI tạo câu ngữ cảnh listening và câu hỏi trắc nghiệm
   */
  async fetchFromGemini(word, apiKey) {
    const prompt = `Bạn là chuyên gia luyện thi IELTS/TOEIC Listening. Phân tích từ vựng: "${word}".
Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown \`\`\`json) với cấu trúc sau:
{
  "meaning": "nghĩa tiếng Việt súc tích, tự nhiên nhất",
  "phonetic": "phiên âm quốc tế IPA",
  "partOfSpeech": "từ loại (noun, verb, adj, adverb)",
  "definition": "định nghĩa tiếng Anh súc tích",
  "example": "một câu ví dụ tiếng Anh có ngữ cảnh như trong bài nghe IELTS Listening Section 3 hoặc hội thoại thường ngày",
  "exampleVi": "bản dịch tiếng Việt tự nhiên của câu ví dụ đó"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    try {
      return JSON.parse(rawContent.trim());
    } catch (e) {
      return null;
    }
  }

  /**
   * Tạo câu ví dụ dự phòng nếu không có mạng
   */
  generateFallbackExample(word, partOfSpeech) {
    const pos = (partOfSpeech || '').toLowerCase();
    if (pos.includes('verb')) {
      return `In the listening test, the lecturer explained how to ${word} the research materials properly.`;
    } else if (pos.includes('adj')) {
      return `The speaker mentioned that this approach proved to be exceptionally ${word} throughout the study.`;
    } else {
      return `The conversation highlighted the crucial role of ${word} in modern society.`;
    }
  }

  /**
   * Tạo câu hỏi trắc nghiệm thông minh dựa trên ngữ cảnh chuẩn Oxford
   */
  createQuizQuestions(targetWord, allWords, preferredType = 'sentence-gap') {
    const questions = [];
    const otherWords = allWords.filter(w => w && w.word && w.word.toLowerCase() !== targetWord.word.toLowerCase());

    // 1. DẠNG ƯU TIÊN SỐ 1: BÀI TẬP NGỮ CẢNH OXFORD (Gap-fill)
    let gapSentence = targetWord.gapSentence;
    if (!gapSentence && targetWord.example) {
      const regex = new RegExp(`\\b${targetWord.word}\\b`, 'gi');
      gapSentence = targetWord.example.replace(regex, '________');
    }
    if (!gapSentence) {
      gapSentence = `In everyday listening, the speaker used the word "________" in conversation.`;
    }

    // Lựa chọn các từ cùng từ loại hoặc trong cùng bài học làm đáp án nhiễu
    const samePosWords = otherWords.filter(w => w.partOfSpeech && targetWord.partOfSpeech && w.partOfSpeech === targetWord.partOfSpeech);
    const poolForDistractors = samePosWords.length >= 3 ? samePosWords : otherWords;

    const optionsWords = this.getDistractors(targetWord.word, poolForDistractors.map(w => w.word), 3);
    optionsWords.push(targetWord.word);
    this.shuffle(optionsWords);

    // Câu hỏi Ngữ cảnh Oxford
    questions.push({
      type: 'sentence-gap',
      title: '📖 Bài tập ngữ cảnh Oxford (Chọn từ điền vào câu):',
      prompt: gapSentence,
      hint: targetWord.meaning,
      fullSentence: targetWord.example || gapSentence.replace('________', targetWord.word),
      exampleVi: targetWord.exampleVi || '',
      options: optionsWords,
      correctAnswer: targetWord.word,
      wordItem: targetWord
    });

    // 2. DẠNG 2: NGHE CÂU NGỮ CẢNH OXFORD VÀ ĐIỀN TỪ (Listening Context Quiz)
    questions.push({
      type: 'listening-context',
      title: '🎧 Nghe câu ngữ cảnh Oxford và chọn từ đúng:',
      prompt: gapSentence,
      listenWord: targetWord.word,
      audioSentence: targetWord.example || '',
      fullSentence: targetWord.example || gapSentence.replace('________', targetWord.word),
      hint: targetWord.meaning,
      exampleVi: targetWord.exampleVi || '',
      options: optionsWords,
      correctAnswer: targetWord.word,
      wordItem: targetWord
    });

    // 3. DẠNG 3: TRẮC NGHIỆM NGHĨA TỪ
    const optionsMeaning = this.getDistractors(targetWord.meaning, otherWords.map(w => w.meaning), 3);
    optionsMeaning.push(targetWord.meaning);
    this.shuffle(optionsMeaning);

    questions.push({
      type: 'word-to-meaning',
      title: 'Chọn nghĩa đúng của từ vựng:',
      prompt: targetWord.word,
      phonetic: targetWord.phonetic,
      partOfSpeech: targetWord.partOfSpeech,
      audioUrl: targetWord.audioUrl,
      fullSentence: targetWord.example || '',
      exampleVi: targetWord.exampleVi || '',
      options: optionsMeaning,
      correctAnswer: targetWord.meaning,
      wordItem: targetWord
    });

    return questions;
  }

  getDistractors(correctItem, pool, count = 3) {
    const validPool = Array.from(new Set(pool.filter(item => item && item !== correctItem && item !== 'Đang cập nhật...')));
    this.shuffle(validPool);

    const result = validPool.slice(0, count);
    // Nếu không đủ từ trong kho, thêm các lựa chọn mẫu thông minh
    const fallbackDistractors = [
      'duy trì, bảo tồn', 'suy giảm đáng kể', 'thích nghi nhanh chóng',
      'phân tích chuyên sâu', 'nhận thức rõ ràng', 'tương quan mật thiết'
    ];
    while (result.length < count) {
      const fb = fallbackDistractors[result.length % fallbackDistractors.length];
      if (!result.includes(fb) && fb !== correctItem) {
        result.push(fb);
      } else {
        result.push(`Lựa chọn ${result.length + 1}`);
      }
    }
    return result;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

window.appEnricher = new WordEnricher();
