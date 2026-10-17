import { AnnouncementLanguage, VoiceGender } from '../types';

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private isSpeaking = false;
  private onStateChangeListeners: Array<(isSpeaking: boolean) => void> = [];

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public subscribeState(listener: (isSpeaking: boolean) => void): () => void {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyState(speaking: boolean) {
    this.isSpeaking = speaking;
    this.onStateChangeListeners.forEach(listener => listener(speaking));
  }

  /**
   * Plays a distinct, crisp fintech soundbox chime bell (C5 -> E5 -> G5)
   */
  public async playChime(volume = 0.8): Promise<void> {
    try {
      const ctx = this.initAudioContext();
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const noteDuration = 0.12;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * noteDuration);

        // Exponential volume decay for a realistic metal bell ring
        gain.gain.setValueAtTime(0.001, now + index * noteDuration);
        gain.gain.exponentialRampToValueAtTime(volume * 0.4, now + index * noteDuration + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * noteDuration + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * noteDuration);
        osc.stop(now + index * noteDuration + 0.45);
      });

      // Wait for chime to complete
      await new Promise(resolve => setTimeout(resolve, 450));
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  /**
   * Generates localized announcement text adhering to strict anti-fraud & legitimate payer identity rules
   */
  public formatAnnouncementText(
    amount: number,
    senderName?: string,
    language: AnnouncementLanguage = 'hi',
    customTemplate?: string
  ): string {
    const cleanAmount = Math.round(amount) === amount ? amount.toString() : amount.toFixed(2);
    const hasSender = Boolean(senderName && senderName.trim().length > 0);

    if (customTemplate && customTemplate.includes('{amount}')) {
      let templ = customTemplate.replace(/{amount}/g, cleanAmount);
      if (hasSender) {
        templ = templ.replace(/{sender}/g, senderName!.trim());
      } else {
        templ = templ.replace(/{sender}/g, '');
      }
      return templ;
    }

    if (language === 'hi') {
      if (hasSender) {
        return `${senderName!.trim()} ki taraf se aapko ${cleanAmount} rupaye prapt hue hain.`;
      }
      return `Aapko ${cleanAmount} rupaye prapt hue hain.`;
    }

    if (language === 'hinglish') {
      if (hasSender) {
        return `Aapko ${cleanAmount} rupaye ${senderName!.trim()} ki taraf se aaye hain.`;
      }
      return `Aapko ${cleanAmount} rupaye aaye hain.`;
    }

    // English
    if (hasSender) {
      return `Received ${cleanAmount} Rupees from ${senderName!.trim()}.`;
    }
    return `Received ${cleanAmount} Rupees.`;
  }

  /**
   * Dispatches speech utterance using Web Speech API with language, voice gender, and volume
   */
  public async speakText(
    text: string,
    options: {
      language?: AnnouncementLanguage;
      voiceGender?: VoiceGender;
      volume?: number;
      rate?: number;
      repeat?: boolean;
      playChimeBefore?: boolean;
    } = {}
  ): Promise<void> {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported on this device/browser.');
      return;
    }

    const {
      language = 'hi',
      voiceGender = 'female',
      volume = 1.0,
      rate = 0.95,
      repeat = false,
      playChimeBefore = true,
    } = options;

    if (playChimeBefore) {
      await this.playChime(volume);
    }

    const speakOnce = (): Promise<void> => {
      return new Promise((resolve) => {
        window.speechSynthesis.cancel(); // Stop any pending utterances
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = Math.max(0, Math.min(1, volume));
        utterance.rate = Math.max(0.7, Math.min(1.3, rate));
        utterance.pitch = voiceGender === 'female' ? 1.05 : 0.85;

        // Select best matching voice
        const voices = window.speechSynthesis.getVoices();
        let targetLang = 'hi-IN';
        if (language === 'en') targetLang = 'en-IN';
        if (language === 'hinglish') targetLang = 'hi-IN';

        const matchingVoice = voices.find(v => {
          const langMatch = v.lang.toLowerCase().startsWith(targetLang.slice(0, 2).toLowerCase());
          if (!langMatch) return false;
          if (voiceGender === 'female') {
            return v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('google');
          }
          return v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man');
        }) || voices.find(v => v.lang.toLowerCase().startsWith(targetLang.slice(0, 2).toLowerCase())) || voices[0];

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => this.notifyState(true);
        utterance.onend = () => {
          this.notifyState(false);
          resolve();
        };
        utterance.onerror = () => {
          this.notifyState(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    };

    await speakOnce();

    if (repeat) {
      await new Promise(r => setTimeout(r, 600));
      await speakOnce();
    }
  }

  public stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notifyState(false);
  }

  public getStatus(): boolean {
    return this.isSpeaking;
  }
}

export const audioEngine = new AudioEngine();
