/**
 * SPEECH & AUDIO ENGINE
 * Quản lý phát âm chuẩn bản xứ (US/UK) và hiệu ứng âm thanh tương tác
 */

class AudioEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.audioContext = null;
    this.initAudioContext();
    this.loadVoices();

    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    } catch (e) {
      console.warn('AudioContext không được hỗ trợ:', e);
    }
  }

  ensureAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getBestVoice(lang = 'en-US') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    const isUK = lang.includes('GB') || lang.includes('UK');
    const targetLang = isUK ? 'en-GB' : 'en-US';

    // Ưu tiên các giọng tự nhiên chất lượng cao (Google, Samantha, Daniel, Siri, Natural)
    const naturalVoice = this.voices.find(v => 
      v.lang.startsWith('en') && 
      (isUK ? v.lang.includes('GB') : !v.lang.includes('GB')) &&
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen'))
    );

    if (naturalVoice) return naturalVoice;

    // Giọng tiếng Anh bất kỳ phù hợp vùng
    const standardVoice = this.voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.toLowerCase()));
    if (standardVoice) return standardVoice;

    // Fallback giọng tiếng Anh bất kỳ
    return this.voices.find(v => v.lang.startsWith('en')) || null;
  }

  speak(text, options = {}) {
    if (!text) return;
    const settings = window.appStorage ? window.appStorage.settings : {};
    const rate = options.rate || settings.speechRate || 0.95;
    const lang = options.lang || settings.speechAccent || 'en-US';

    // Nếu từ có audioUrl (MP3 trực tiếp từ từ điển) và options không cưỡng bức dùng synth
    if (options.audioUrl && !options.forceSynth) {
      try {
        const audio = new Audio(options.audioUrl);
        audio.playbackRate = rate;
        audio.play().catch(() => {
          this.speakWithSynth(text, lang, rate, options.onEnd);
        });
        if (options.onEnd) {
          audio.onended = options.onEnd;
        }
        return;
      } catch (e) {
        // Fallback sang SpeechSynthesis
      }
    }

    this.speakWithSynth(text, lang, rate, options.onEnd);
  }

  speakWithSynth(text, lang, rate, onEnd) {
    if (!this.synth) return;

    // Huỷ các câu đang nói dở để không bị chồng tiếng
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = this.getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Hiệu ứng âm thanh bằng Web Audio API (không cần tải file mp3 ngoài)
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    const settings = window.appStorage ? window.appStorage.settings : {};
    if (settings.soundEffects === false) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  }

  playCorrect() {
    this.vibrate([20, 50, 20]);
    // Âm thanh chúc mừng 2 nốt trong trẻo (Major Chord E5 -> G#5)
    this.playTone(659.25, 'triangle', 0.12, 0.15); // E5
    setTimeout(() => {
      this.playTone(830.61, 'triangle', 0.25, 0.15); // G#5
    }, 90);
  }

  playIncorrect() {
    this.vibrate([80, 40, 80]);
    // Âm thanh trầm báo sai
    this.playTone(220, 'sawtooth', 0.15, 0.12);
    setTimeout(() => {
      this.playTone(185, 'sawtooth', 0.25, 0.12);
    }, 120);
  }

  playFlip() {
    // Tiếng lật thẻ nhẹ
    this.playTone(400, 'sine', 0.05, 0.04);
  }

  playVictory() {
    this.vibrate([50, 50, 50, 50, 100]);
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.3, 0.18);
      }, idx * 100);
    });
  }

  vibrate(pattern = [30]) {
    const settings = window.appStorage ? window.appStorage.settings : {};
    if (settings.hapticFeedback !== false && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }
}

window.appAudio = new AudioEngine();
