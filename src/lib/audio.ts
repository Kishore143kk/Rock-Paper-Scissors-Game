let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

function playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export const sounds = {
  select: () => playTone(600, 'sine', 0.1, 0.05),
  computer: () => playTone(400, 'square', 0.15, 0.05),
  win: () => {
    playTone(400, 'sine', 0.1, 0.1);
    setTimeout(() => playTone(600, 'sine', 0.2, 0.1), 100);
    setTimeout(() => playTone(800, 'sine', 0.3, 0.1), 200);
  },
  lose: () => {
    playTone(400, 'sawtooth', 0.2, 0.1);
    setTimeout(() => playTone(300, 'sawtooth', 0.3, 0.1), 150);
    setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.1), 300);
  },
  draw: () => {
    playTone(300, 'triangle', 0.2, 0.1);
    setTimeout(() => playTone(300, 'triangle', 0.2, 0.1), 200);
  }
};
