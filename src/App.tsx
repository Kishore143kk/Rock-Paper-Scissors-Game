import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Brain, Target } from 'lucide-react';
import { sounds } from './lib/audio';

type Choice = 'rock' | 'paper' | 'scissors';
type Result = 'win' | 'lose' | 'draw' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

const CHOICES: Record<Choice, { emoji: string; label: string; beats: Choice }> = {
  rock: { emoji: '✊', label: 'Rock', beats: 'scissors' },
  paper: { emoji: '✋', label: 'Paper', beats: 'rock' },
  scissors: { emoji: '✌️', label: 'Scissors', beats: 'paper' },
};

const BEATS_MAP: Record<Choice, Choice> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock'
};

export default function App() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [bestOf, setBestOf] = useState<number>(0); // 0 = endless
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [playerHistory, setPlayerHistory] = useState<Choice[]>([]);
  const [matchWinner, setMatchWinner] = useState<'player' | 'computer' | null>(null);

  const [scores, setScores] = useState({
    wins: 0,
    losses: 0,
    draws: 0,
  });

  const handlePlay = (choice: Choice) => {
    if (isPlaying || matchWinner) return;
    
    sounds.select();
    setIsPlaying(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);
    setPlayerHistory(prev => [...prev, choice]);

    // Simulate computer thinking
    setTimeout(() => {
      sounds.computer();
      
      const choices: Choice[] = ['rock', 'paper', 'scissors'];
      let randomChoice: Choice;

      if (difficulty === 'easy') {
        randomChoice = choices[Math.floor(Math.random() * choices.length)];
      } else if (difficulty === 'medium') {
        // 30% chance to pick the winning move
        if (Math.random() < 0.3) {
          randomChoice = BEATS_MAP[choice];
        } else {
          randomChoice = choices[Math.floor(Math.random() * choices.length)];
        }
      } else {
        // Hard: Predict based on history
        if (playerHistory.length < 2) {
          randomChoice = choices[Math.floor(Math.random() * choices.length)];
        } else {
          const counts = { rock: 0, paper: 0, scissors: 0 };
          playerHistory.forEach(c => counts[c]++);
          const mostFrequent = (Object.keys(counts) as Choice[]).reduce((a, b) => counts[a as Choice] > counts[b as Choice] ? a : b) as Choice;
          randomChoice = BEATS_MAP[mostFrequent];
        }
      }

      setComputerChoice(randomChoice);

      // Determine winner
      let newResult: Result = 'draw';
      if (choice === randomChoice) {
        newResult = 'draw';
        setScores(s => ({ ...s, draws: s.draws + 1 }));
        sounds.draw();
      } else if (CHOICES[choice].beats === randomChoice) {
        newResult = 'win';
        setScores(s => {
          const newWins = s.wins + 1;
          if (bestOf > 0 && newWins >= Math.ceil(bestOf / 2)) {
            setTimeout(() => setMatchWinner('player'), 600);
          }
          return { ...s, wins: newWins };
        });
        sounds.win();
      } else {
        newResult = 'lose';
        setScores(s => {
          const newLosses = s.losses + 1;
          if (bestOf > 0 && newLosses >= Math.ceil(bestOf / 2)) {
            setTimeout(() => setMatchWinner('computer'), 600);
          }
          return { ...s, losses: newLosses };
        });
        sounds.lose();
      }
      
      setResult(newResult);
      setIsPlaying(false);
    }, 1000);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScores({ wins: 0, losses: 0, draws: 0 });
    setPlayerHistory([]);
    setMatchWinner(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-8 px-4 font-sans selection:bg-indigo-500/30">
      
      {/* Match Winner Overlay */}
      <AnimatePresence>
        {matchWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full"
            >
              <div className="text-6xl mb-6">
                {matchWinner === 'player' ? '🏆' : '💀'}
              </div>
              <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {matchWinner === 'player' ? 'Match Won!' : 'Match Lost!'}
              </h2>
              <p className="text-slate-400 mb-8">
                {matchWinner === 'player' ? 'You defeated the computer.' : 'The computer outsmarted you.'}
              </p>
              <button
                onClick={resetGame}
                className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl w-full space-y-8">
        
        {/* Header & Settings */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Rock Paper Scissors
            </h1>
          </div>
          
          {/* Settings Bar */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
              <Brain size={18} className="text-slate-400 ml-2" />
              <div className="flex gap-1">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => { setDifficulty(d); resetGame(); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold capitalize transition-all ${difficulty === d ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
              <Target size={18} className="text-slate-400 ml-2" />
              <div className="flex gap-1">
                {[0, 3, 5].map(b => (
                  <button
                    key={b}
                    onClick={() => { setBestOf(b); resetGame(); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${bestOf === b ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    {b === 0 ? 'Endless' : `BO${b}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="flex justify-center gap-4 md:gap-8 pt-4">
            <ScoreCard label="Wins" score={scores.wins} color="text-emerald-400" />
            <ScoreCard label="Draws" score={scores.draws} color="text-slate-400" />
            <ScoreCard label="Losses" score={scores.losses} color="text-rose-400" />
          </div>
        </div>

        {/* Game Arena */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <div className="text-center w-1/3">
              <h2 className="text-xl font-semibold mb-6 text-slate-300">You</h2>
              <div className="h-32 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {playerChoice ? (
                    <motion.div
                      key={playerChoice}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="text-7xl drop-shadow-2xl"
                    >
                      {CHOICES[playerChoice].emoji}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-slate-700 text-5xl font-bold"
                    >
                      ?
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-center w-1/3 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-700 italic tracking-widest">VS</span>
            </div>

            <div className="text-center w-1/3">
              <h2 className="text-xl font-semibold mb-6 text-slate-300">Computer</h2>
              <div className="h-32 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="thinking"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="text-indigo-500"
                    >
                      <RefreshCw size={48} strokeWidth={2.5} />
                    </motion.div>
                  ) : computerChoice ? (
                    <motion.div
                      key={computerChoice}
                      initial={{ scale: 0, rotate: 45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="text-7xl drop-shadow-2xl"
                    >
                      {CHOICES[computerChoice].emoji}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-slate-700 text-5xl font-bold"
                    >
                      ?
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Result Banner */}
          <div className="h-16 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={result}
                  initial={{ y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className={`text-2xl md:text-3xl font-black px-8 py-3 rounded-2xl tracking-wide uppercase ${
                    result === 'win' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    result === 'lose' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                  }`}
                >
                  {result === 'win' ? 'You Win!' : result === 'lose' ? 'Computer Wins!' : "It's a Draw!"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <h3 className="text-center text-sm font-bold tracking-widest uppercase text-slate-500">Choose your weapon</h3>
          <div className="flex justify-center gap-4 md:gap-6">
            {(Object.entries(CHOICES) as [Choice, typeof CHOICES[Choice]][]).map(([key, { emoji, label }]) => (
              <button
                key={key}
                onClick={() => handlePlay(key)}
                disabled={isPlaying || matchWinner !== null}
                className={`
                  relative group flex flex-col items-center p-6 rounded-3xl
                  bg-slate-900 border-2 border-slate-800
                  transition-all duration-300 ease-out
                  ${isPlaying || matchWinner ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:bg-slate-800 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] active:translate-y-0 active:scale-95'}
                `}
              >
                <span className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">{emoji}</span>
                <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-300 transition-colors">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        {(scores.wins > 0 || scores.losses > 0 || scores.draws > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95 font-medium"
            >
              <RefreshCw size={16} />
              Reset Score
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="bg-slate-900 px-6 py-4 rounded-3xl border border-slate-800 min-w-[100px] md:min-w-[120px] shadow-lg">
      <div className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-2">{label}</div>
      <div className={`text-4xl font-black ${color}`}>{score}</div>
    </div>
  );
}
