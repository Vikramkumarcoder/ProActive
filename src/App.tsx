import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  CheckSquare,
  Calendar,
  Flame,
  Award,
  Settings,
  MessageSquare,
  Clock,
  Mic,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  AlertCircle,
  Check,
  Grid,
  TrendingUp,
  BarChart2,
  FileText,
  User,
  Coffee,
  X,
  Sparkle,
  Zap,
  CheckCircle2,
  Sliders,
  HelpCircle
} from 'lucide-react';

// ==========================================
// TYPES DEFINITIONS
// ==========================================
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  duration?: string;
  difficulty?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Work' | 'Study' | 'Health' | 'Personal' | 'Routine';
  priority: 'High' | 'Medium' | 'Low';
  deadline: string; // descriptive, e.g. "Today 6 PM" or "Tomorrow Morning"
  duration: number; // in hours
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subtasks: SubTask[];
  completed: boolean;
  delayedCount: number;
}

interface Habit {
  id: string;
  title: string;
  completedDays: string[]; // array of ISO strings "YYYY-MM-DD"
  streak: number;
  category: string;
}

interface ScheduleBlock {
  id: string;
  time: string;
  title: string;
  type: 'Deep Work' | 'Break' | 'Task' | 'Routine';
  note: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  icon: string;
}

// ==========================================
// SEED DATA FOR NEW SESSIONS
// ==========================================
const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Research Paper: AI Systems Architecture',
    description: 'Literature review of LLM reasoning engines and agent constraints.',
    category: 'Study',
    priority: 'High',
    deadline: 'Tomorrow 6 PM',
    duration: 6,
    difficulty: 'Hard',
    subtasks: [
      { id: 's1', title: 'Search Google Scholar for recent publications', completed: true, duration: '1h', difficulty: 'Medium' },
      { id: 's2', title: 'Analyze agent task-lifecycle strategies', completed: false, duration: '2h', difficulty: 'Hard' },
      { id: 's3', title: 'Draft the abstract and introduction section', completed: false, duration: '3h', difficulty: 'Hard' }
    ],
    completed: false,
    delayedCount: 0
  },
  {
    id: 't2',
    title: 'Fix Authentication Token Leak bug',
    description: 'Resolve CORS issues and encrypt credentials in local headers.',
    category: 'Work',
    priority: 'High',
    deadline: 'Today 4 PM',
    duration: 2,
    difficulty: 'Medium',
    subtasks: [
      { id: 's4', title: 'Trace local network requests in developer console', completed: true, duration: '30m', difficulty: 'Easy' },
      { id: 's5', title: 'Apply encrypted secure cookie wrappers', completed: false, duration: '1.5h', difficulty: 'Medium' }
    ],
    completed: false,
    delayedCount: 1
  },
  {
    id: 't3',
    title: 'Export Production Vector Assets',
    description: 'Export finalized icons and high-contrast splash screens.',
    category: 'Work',
    priority: 'Low',
    deadline: 'Friday Afternoon',
    duration: 1,
    difficulty: 'Easy',
    subtasks: [],
    completed: false,
    delayedCount: 0
  }
];

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', title: 'Morning Meditation (15m)', completedDays: [], streak: 3, category: 'Health' },
  { id: 'h2', title: 'Hydration Intake (2L)', completedDays: [], streak: 8, category: 'Health' },
  { id: 'h3', title: 'Read 20 Pages', completedDays: [], streak: 0, category: 'Personal' },
  { id: 'h4', title: 'Algorithmic Coding (1h)', completedDays: [], streak: 12, category: 'Study' }
];

const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { id: 'sc1', time: '9:00 AM - 11:30 AM', title: 'Engineering Sprint: Secure Login Auth', type: 'Deep Work', note: 'AI Suggestion: Close email notifications and chat panels.' },
  { id: 'sc2', time: '11:30 AM - 12:00 PM', title: 'Mindfulness, Water & Physical Stretch', type: 'Break', note: 'AI Suggestion: Walk away from screens for ocular relief.' },
  { id: 'sc3', time: '1:00 PM - 2:00 PM', title: 'Strategic Roadmap Review', type: 'Task', note: 'Re-prioritized due to afternoon peak-focus metrics.' }
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Victory', description: 'Complete your first high-priority task before the AI deadline warning.', xpReward: 100, unlocked: false, icon: '🔥' },
  { id: 'a2', title: 'Focus Ninja', description: 'Log more than 120 minutes of Deep Work Focus.', xpReward: 250, unlocked: false, icon: '⚡' },
  { id: 'a3', title: 'Habit Champion', description: 'Reach a streak of 10 days on any routine habit.', xpReward: 150, unlocked: false, icon: '🌟' },
  { id: 'a4', title: 'No Procrastination', description: 'Finish a task that was rescheduled 2+ times.', xpReward: 200, unlocked: false, icon: '🧠' }
];

export default function App() {
  // ==========================================
  // APP STATE (LOCAL STORAGE PERSISTED)
  // ==========================================
  const [tasks, setTasks] = useState<Task[]>(() => {
    const val = localStorage.getItem('proactive_tasks');
    return val ? JSON.parse(val) : DEFAULT_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const val = localStorage.getItem('proactive_habits');
    return val ? JSON.parse(val) : DEFAULT_HABITS;
  });

  const [schedule, setSchedule] = useState<ScheduleBlock[]>(() => {
    const val = localStorage.getItem('proactive_schedule');
    return val ? JSON.parse(val) : DEFAULT_SCHEDULE;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const val = localStorage.getItem('proactive_achievements');
    return val ? JSON.parse(val) : DEFAULT_ACHIEVEMENTS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const val = localStorage.getItem('proactive_chat_messages');
    return val ? JSON.parse(val) : [
      { role: 'model', parts: [{ text: "Hello! I am your ProActive AI companion. I don't just list your tasks; I help you build optimized schedules, break down massive work blocks, suggest breaks, and keep you on track. How can I assist your workflow today?" }] }
    ];
  });

  const [productivityScore, setProductivityScore] = useState(() => {
    const val = localStorage.getItem('proactive_score');
    return val ? parseInt(val) : 84;
  });

  const [level, setLevel] = useState(() => {
    const val = localStorage.getItem('proactive_level');
    return val ? parseInt(val) : 14;
  });

  const [xp, setXp] = useState(() => {
    const val = localStorage.getItem('proactive_xp');
    return val ? parseInt(val) : 650;
  });

  const [focusMinutes, setFocusMinutes] = useState(() => {
    const val = localStorage.getItem('proactive_focus_minutes');
    return val ? parseInt(val) : 160;
  });

  const [coachAdvice, setCoachAdvice] = useState(() => {
    return localStorage.getItem('proactive_coach_advice') || '"You usually hit peak focus around 10 AM. You have high-priority security tasks due. Ready for Deep Work?"';
  });

  const [eisenhowerMatrix, setEisenhowerMatrix] = useState<{
    urgentImportant: string[];
    importantNotUrgent: string[];
    urgentNotImportant: string[];
    routine: string[];
  }>(() => {
    const val = localStorage.getItem('proactive_matrix');
    return val ? JSON.parse(val) : {
      urgentImportant: ['Fix Authentication Token Leak bug', 'Research Paper: AI Systems Architecture'],
      importantNotUrgent: ['Weekly Workout', 'Read 20 Pages'],
      urgentNotImportant: ['Export Production Vector Assets'],
      routine: ['Morning Meditation (15m)', 'Hydration Intake (2L)']
    };
  });

  // UI Navigation / Sidebar Toggles
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'scheduler' | 'habits' | 'analytics' | 'settings'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coachingTone, setCoachingTone] = useState<'empathic' | 'direct' | 'aggressive'>('direct');
  
  // AI Actions / Loading States
  const [aiLoading, setAiLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [breakingTaskId, setBreakingTaskId] = useState<string | null>(null);

  // Focus Timer Pomodoro State
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'short_break' | 'long_break'>('pomodoro');
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeWhiteNoise, setActiveWhiteNoise] = useState<'none' | 'ocean' | 'binaural' | 'rain'>('none');

  // Input Controllers for adding tasks & habits
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [quickTaskCategory, setQuickTaskCategory] = useState<'Work' | 'Study' | 'Health' | 'Personal' | 'Routine'>('Work');
  
  // Complex Task Modal / Form Controls
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Work' as const,
    priority: 'High' as const,
    deadline: 'Today at 6 PM',
    duration: 1,
    difficulty: 'Easy' as const
  });

  // Simulated Dictation & Web Speech API Voice States
  const [chatInputText, setChatInputText] = useState('');
  const [voiceDictationActive, setVoiceDictationActive] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Web Audio Context for Browser Sound Synthesis (Proactive ambient white noise)
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // ==========================================
  // STORAGE LOGIC / SYNCHRONIZER
  // ==========================================
  useEffect(() => {
    localStorage.setItem('proactive_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('proactive_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('proactive_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('proactive_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('proactive_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('proactive_score', productivityScore.toString());
  }, [productivityScore]);

  useEffect(() => {
    localStorage.setItem('proactive_level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('proactive_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('proactive_focus_minutes', focusMinutes.toString());
  }, [focusMinutes]);

  useEffect(() => {
    localStorage.setItem('proactive_coach_advice', coachAdvice);
  }, [coachAdvice]);

  useEffect(() => {
    localStorage.setItem('proactive_matrix', JSON.stringify(eisenhowerMatrix));
  }, [eisenhowerMatrix]);

  // Push Notifications simulation
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 6000);
  };

  // ==========================================
  // XP & GAMIFICATION LEVEL LOGIC
  // ==========================================
  const addXp = (amount: number) => {
    setXp((prevXp) => {
      const newXp = prevXp + amount;
      const nextLevelThreshold = level * 100;
      if (newXp >= nextLevelThreshold) {
        setLevel((prevLvl) => prevLvl + 1);
        showNotification(`🎉 Level Up! You reached Level ${level + 1}!`);
        return newXp - nextLevelThreshold;
      }
      return newXp;
    });
  };

  // ==========================================
  // SERVER SIDE AI COMMUNICATION HELPER
  // ==========================================
  const callServerAI = async (action: string, payload: any) => {
    try {
      const response = await fetch('/api/ai-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server processing issue');
      }
      return await response.json();
    } catch (err: any) {
      console.error('API integration error:', err);
      showNotification(`⚠️ Connection limits: ${err.message || 'Server offline'}`);
      throw err;
    }
  };

  // ==========================================
  // AI SCHEDULE OPTIMIZATION ACTION
  // ==========================================
  const handleAIOptimize = async () => {
    setAiLoading(true);
    showNotification('🧠 AI Proactive Engine is analyzing deadlines, energy levels, and workload...');
    try {
      const result = await callServerAI('suggest-schedule', { tasks, habits });
      if (result.schedule) setSchedule(result.schedule);
      if (result.coachMessage) setCoachAdvice(result.coachMessage);
      if (result.matrix) setEisenhowerMatrix(result.matrix);
      if (result.productivityScore) setProductivityScore(result.productivityScore);
      showNotification('✅ Optimized schedule successfully generated!');
      addXp(40);
    } catch (err) {
      // Fallback in case of server/key setup timeouts
      const fallbackMatrix = {
        urgentImportant: tasks.filter(t => t.priority === 'High' && !t.completed).map(t => t.title),
        importantNotUrgent: tasks.filter(t => t.priority === 'Medium' && !t.completed).map(t => t.title),
        urgentNotImportant: tasks.filter(t => t.priority === 'Low' && !t.completed).map(t => t.title),
        routine: habits.map(h => h.title)
      };
      setEisenhowerMatrix(fallbackMatrix);
      showNotification('⚠️ Loaded local backup algorithm successfully.');
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================
  // AI TASK BREAKDOWN ACTION
  // ==========================================
  const handleAITaskBreakdown = async (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    setBreakingTaskId(taskId);
    showNotification(`🧠 breaking down "${targetTask.title}" into bite-sized actionable blocks...`);
    try {
      const result = await callServerAI('breakdown-task', { task: targetTask });
      if (result.subtasks && result.subtasks.length > 0) {
        const formattedSubtasks: SubTask[] = result.subtasks.map((st: any, idx: number) => ({
          id: `${taskId}-sub-${idx}-${Date.now()}`,
          title: st.title,
          completed: false,
          duration: st.duration,
          difficulty: st.difficulty
        }));
        
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            return { ...t, subtasks: [...t.subtasks, ...formattedSubtasks] };
          }
          return t;
        }));
        showNotification(`✅ Generated ${formattedSubtasks.length} subtasks for "${targetTask.title}"!`);
        addXp(30);
      }
    } catch (err) {
      showNotification('⚠️ Task breakdown requires server connection.');
    } finally {
      setBreakingTaskId(null);
    }
  };

  // ==========================================
  // AUDIO SYNTHESIZER (BINAURAL & OCEAN WAVES)
  // ==========================================
  const startSynthSound = (type: 'ocean' | 'binaural' | 'rain') => {
    try {
      stopSynthSound();
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = 4 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'rain') {
        // White noise generator
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Apply a gentle bandpass filter to sound like heavy rainfall
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1.5;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.08;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;

      } else if (type === 'ocean') {
        // Brown noise generator for deep oceanic wave sounds
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        }
        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        // Lowpass filter for deep rumbling water effect
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;

        // Periodic LFO to simulate real breathing waves
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15; // 0.15Hz - 1 wave cycle every 6 seconds

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05;

        const mainGain = ctx.createGain();
        mainGain.gain.value = 0.06;

        lfo.connect(lfoGain);
        lfoGain.connect(mainGain.gain); // modulate volume

        brownNoise.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);

        brownNoise.start();
        lfo.start();
        noiseNodeRef.current = brownNoise;

      } else if (type === 'binaural') {
        // Binaural focus beats - Left Ear 150Hz, Right Ear 155Hz (5Hz Theta beats)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        
        oscL.type = 'sine';
        oscL.frequency.value = 150;
        
        oscR.type = 'sine';
        oscR.frequency.value = 154; // 4Hz Theta beat for deep concentration

        const pannerL = ctx.createStereoPanner();
        pannerL.pan.value = -1; // hard left
        
        const pannerR = ctx.createStereoPanner();
        pannerR.pan.value = 1; // hard right

        const gainL = ctx.createGain();
        gainL.gain.value = 0.04;
        
        const gainR = ctx.createGain();
        gainR.gain.value = 0.04;

        oscL.connect(pannerL);
        pannerL.connect(gainL);
        gainL.connect(ctx.destination);

        oscR.connect(pannerR);
        pannerR.connect(gainR);
        gainR.connect(ctx.destination);

        oscL.start();
        oscR.start();

        // Save reference to stop later
        noiseNodeRef.current = {
          stop: () => {
            oscL.stop();
            oscR.stop();
          }
        } as any;
      }
    } catch (e) {
      console.error('AudioContext synth error:', e);
    }
  };

  const stopSynthSound = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (activeWhiteNoise !== 'none') {
      startSynthSound(activeWhiteNoise);
    } else {
      stopSynthSound();
    }
    return () => stopSynthSound();
  }, [activeWhiteNoise]);

  // ==========================================
  // POMODORO FOCUS TIMER COUNTDOWN
  // ==========================================
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished
          setIsTimerRunning(false);
          stopSynthSound();
          setActiveWhiteNoise('none');
          
          if (timerMode === 'pomodoro') {
            const addedMin = 25;
            setFocusMinutes(prev => prev + addedMin);
            addXp(120);
            showNotification(`🏆 Phenomenal job! You finished a 25-minute Deep Work focus session! +120 XP`);
            
            // Unlock Focus Ninja achievement
            if (focusMinutes + addedMin >= 120) {
              unlockAchievement('a2');
            }
            
            setTimerMode('short_break');
            setTimerMinutes(5);
          } else {
            showNotification(`🧘 Break completed. Ready to step into productivity?`);
            setTimerMode('pomodoro');
            setTimerMinutes(25);
          }
          setTimerSeconds(0);
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  const handleTimerAction = (action: 'play' | 'pause' | 'reset') => {
    if (action === 'play') setIsTimerRunning(true);
    if (action === 'pause') setIsTimerRunning(false);
    if (action === 'reset') {
      setIsTimerRunning(false);
      setTimerMinutes(timerMode === 'pomodoro' ? 25 : timerMode === 'short_break' ? 5 : 15);
      setTimerSeconds(0);
    }
  };

  const handleTimerModeChange = (mode: 'pomodoro' | 'short_break' | 'long_break') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimerMinutes(mode === 'pomodoro' ? 25 : mode === 'short_break' ? 5 : 15);
    setTimerSeconds(0);
  };

  // ==========================================
  // INTERACTIVE CHAT ACTION
  // ==========================================
  const handleChatSend = async () => {
    if (!chatInputText.trim()) return;
    const userMsg = chatInputText;
    setChatInputText('');
    setChatMessages(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setChatLoading(true);

    try {
      // Map existing chat history structure
      const formattedHistory = chatMessages.slice(-8).map(m => ({
        role: m.role,
        parts: [{ text: m.parts[0].text }]
      }));

      const response = await callServerAI('chat', { message: userMsg, history: formattedHistory });
      if (response.text) {
        setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
        
        // Dynamic voice synthesis if supported
        if ('speechSynthesis' in window) {
          const cleanText = response.text.replace(/[#*`_]/g, '').slice(0, 150);
          const speech = new SpeechSynthesisUtterance(cleanText);
          speech.rate = 1.05;
          window.speechSynthesis.speak(speech);
        }
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm having trouble connecting to my cognitive model right now. Let's tackle your priorities locally. Focus on your top Urgent task!" }] }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ==========================================
  // VOICE DICTATION & SPEECH SYNTHESIS
  // ==========================================
  const handleSimulatedVoiceCommand = async (spokenText: string) => {
    setVoiceLoading(true);
    showNotification(`🎤 Coach is processing verbal input: "${spokenText}"...`);
    try {
      const parsed = await callServerAI('parse-voice', { text: spokenText });
      
      if (parsed.coachResponse && 'speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(parsed.coachResponse);
        window.speechSynthesis.speak(speech);
      }

      if (parsed.intent === 'create_task' && parsed.data && parsed.data.title) {
        const d = parsed.data;
        const newVoiceTask: Task = {
          id: `task-${Date.now()}`,
          title: d.title,
          description: 'Created automatically via voice dictation.',
          category: d.category || 'Work',
          priority: d.priority || 'Medium',
          deadline: d.deadline || 'Today',
          duration: d.estimatedDuration ? parseFloat(d.estimatedDuration) || 1 : 1,
          difficulty: 'Medium',
          subtasks: [],
          completed: false,
          delayedCount: 0
        };
        setTasks(prev => [newVoiceTask, ...prev]);
        showNotification(`🎙️ Created task: "${d.title}" via Voice!`);
        addXp(50);
      } else if (parsed.intent === 'create_habit' && parsed.data && parsed.data.title) {
        const d = parsed.data;
        const newVoiceHabit: Habit = {
          id: `habit-${Date.now()}`,
          title: d.title,
          streak: 0,
          category: d.category || 'Personal',
          completedDays: []
        };
        setHabits(prev => [newVoiceHabit, ...prev]);
        showNotification(`🎙️ Created habit: "${d.title}" via Voice!`);
        addXp(40);
      } else {
        // Append voice transcription and response directly to floating chat
        setChatMessages(prev => [
          ...prev, 
          { role: 'user', parts: [{ text: `[Voice Command] ${spokenText}` }] },
          { role: 'model', parts: [{ text: parsed.coachResponse || "Understood! Let's schedule that priority." }] }
        ]);
        setIsChatOpen(true);
      }
    } catch (e) {
      showNotification('⚠️ Voice transcription failed to contact LLM backend.');
    } finally {
      setVoiceLoading(false);
    }
  };

  const toggleRealSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Simulate speech input for environment constraints / iframe boundaries
      const prompts = [
        "Remind me to complete my assignment before Friday.",
        "Add a high priority task to review security schemas tomorrow morning.",
        "I need to read 20 pages of scientific journal every day.",
        "Schedule gym workout session this evening at 6 PM.",
        "Recommend study plans for my coding finals this week."
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setSpeechTranscript(randomPrompt);
      setVoiceDictationActive(true);
      setTimeout(() => {
        handleSimulatedVoiceCommand(randomPrompt);
        setVoiceDictationActive(false);
      }, 1500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setVoiceDictationActive(true);
      setSpeechTranscript('Listening...');
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setVoiceDictationActive(false);
    };

    recognition.onend = () => {
      setVoiceDictationActive(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setSpeechTranscript(speechToText);
      handleSimulatedVoiceCommand(speechToText);
    };

    recognition.start();
  };

  // ==========================================
  // TASK INTERACTIONS
  // ==========================================
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          addXp(50);
          showNotification(`🚀 Completed task: "${t.title}"! +50 XP`);
          unlockAchievement('a1'); // unlock first victory
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(st => {
          if (st.id === subtaskId) {
            const nextCompleted = !st.completed;
            if (nextCompleted) {
              addXp(15);
              showNotification(`⚡ Subtask complete: "${st.title}"! +15 XP`);
            }
            return { ...st, completed: nextCompleted };
          }
          return st;
        });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showNotification('🗑️ Task removed.');
  };

  const rescheduleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCount = t.delayedCount + 1;
        let penaltyMsg = '';
        if (nextCount >= 3) {
          penaltyMsg = `🚨 Coach Proactive Warning: You have procrastinated on "${t.title}" ${nextCount} times. Start with just 15 minutes right now!`;
        } else {
          penaltyMsg = `⚠️ Rescheduled "${t.title}". Coach: Let's block 30 minutes tomorrow for strategic execution.`;
        }
        showNotification(penaltyMsg);
        return { ...t, delayedCount: nextCount, deadline: 'Tomorrow Afternoon' };
      }
      return t;
    }));
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const added: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      deadline: newTask.deadline,
      duration: newTask.duration,
      difficulty: newTask.difficulty,
      subtasks: [],
      completed: false,
      delayedCount: 0
    };

    setTasks([added, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      category: 'Work',
      priority: 'High',
      deadline: 'Today at 6 PM',
      duration: 1,
      difficulty: 'Easy'
    });
    setShowTaskForm(false);
    showNotification(`📝 Task "${added.title}" successfully logged!`);
    addXp(30);
  };

  const handleQuickTaskAdd = () => {
    if (!quickTaskTitle.trim()) return;
    const added: Task = {
      id: `task-${Date.now()}`,
      title: quickTaskTitle,
      description: 'Quickly logged.',
      category: quickTaskCategory,
      priority: quickTaskPriority,
      deadline: 'Today',
      duration: 1.5,
      difficulty: 'Medium',
      subtasks: [],
      completed: false,
      delayedCount: 0
    };
    setTasks([added, ...tasks]);
    setQuickTaskTitle('');
    showNotification(`📝 Fast-tracked task: "${added.title}"`);
    addXp(20);
  };

  // ==========================================
  // HABIT INTERACTIONS
  // ==========================================
  const toggleHabit = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const wasCompletedToday = h.completedDays.includes(todayStr);
        let updatedDays = [...h.completedDays];
        let nextStreak = h.streak;

        if (wasCompletedToday) {
          updatedDays = updatedDays.filter(d => d !== todayStr);
          nextStreak = Math.max(0, h.streak - 1);
        } else {
          updatedDays.push(todayStr);
          nextStreak = h.streak + 1;
          addXp(40);
          showNotification(`🔥 Daily habit checked off! ${h.title} streak is now ${nextStreak} days! +40 XP`);
          
          if (nextStreak >= 10) {
            unlockAchievement('a3'); // habit champion
          }
        }
        return { ...h, completedDays: updatedDays, streak: nextStreak };
      }
      return h;
    }));
  };

  const handleCreateHabit = (title: string, category: string) => {
    if (!title.trim()) return;
    const added: Habit = {
      id: `habit-${Date.now()}`,
      title,
      streak: 0,
      completedDays: [],
      category
    };
    setHabits([...habits, added]);
    showNotification(`🔥 New custom habit tracked: "${title}"`);
    addXp(30);
  };

  // ==========================================
  // UNLOCK ACHIEVEMENTS LOGIC
  // ==========================================
  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === id && !a.unlocked) {
        addXp(a.xpReward);
        return { ...a, unlocked: true };
      }
      return a;
    }));
  };

  // ==========================================
  // PDF REPORT EXPORT SIMULATION
  // ==========================================
  const handleExportPDF = () => {
    showNotification('📄 Formatting premium PDF weekly performance audit...');
    setTimeout(() => {
      const activeTasks = tasks.filter(t => !t.completed);
      const finishedTasks = tasks.filter(t => t.completed);
      const docContent = `
==============================================
    PROACTIVE AI - WEEKLY PRODUCTIVITY REPORT
==============================================
Date Generated: ${new Date().toLocaleDateString()}
Current Focus Score: ${productivityScore}/100
Current Gamified Level: Level ${level}
Total Deep Work Tracked: ${focusMinutes} Minutes

SUMMARY STATS:
----------------------------------------------
Completed Tasks: ${finishedTasks.length}
Overdue/Rescheduled Tasks: ${tasks.reduce((acc, t) => acc + t.delayedCount, 0)}
Active Strategic Habits: ${habits.length}

COMPLETED TASKS HISTORY:
${finishedTasks.map(t => `- [✓] ${t.title} (${t.category} - ${t.difficulty})`).join('\n') || 'None'}

PENDING STRATEGIC LOAD:
${activeTasks.map(t => `- [ ] ${t.title} (Deadline: ${t.deadline}, Priority: ${t.priority})`).join('\n') || 'None'}

COACH ADVICE FEEDBACK:
${coachAdvice}

==============================================
    End of Report - Generated by ProActive AI
==============================================
`;
      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ProActive_Weekly_Productivity_Report_${Date.now()}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('✅ Export complete! Premium report downloaded successfully.');
    }, 1500);
  };

  // Filter tasks based on Search query
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Next Critical Deadline calculation
  const nextCriticalTask = tasks.find(t => !t.completed && t.priority === 'High');

  return (
    <div id="proactive-app-container" className="h-screen w-full bg-[#09090B] text-slate-200 font-sans flex flex-row overflow-hidden">
      
      {/* GLOBAL PUSH NOTIFICATION POPUP */}
      {notification && (
        <div id="ai-coach-notification" className="fixed top-6 right-6 z-50 max-w-sm bg-slate-900 border border-indigo-500/30 p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-fade-in backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
            <Sparkle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">ProActive Assistant</span>
            <p className="text-sm text-slate-200 mt-0.5 leading-relaxed">{notification}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-300 ml-auto shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside id="app-sidebar" className="w-66 border-r border-slate-800 bg-[#09090B] flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold tracking-wider">P</span>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block">ProActive AI</span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider">V4 ENGINE ACTIVE</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 py-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white font-medium shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Grid className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === 'tasks'
                ? 'bg-slate-800 text-white font-medium shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <CheckSquare className={`w-5 h-5 ${activeTab === 'tasks' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Task Manager
            {tasks.filter(t => !t.completed).length > 0 && (
              <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tasks.filter(t => !t.completed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('scheduler')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === 'scheduler'
                ? 'bg-slate-800 text-white font-medium shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'scheduler' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Smart Scheduler
          </button>

          <button
            onClick={() => setActiveTab('habits')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === 'habits'
                ? 'bg-slate-800 text-white font-medium shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Flame className={`w-5 h-5 ${activeTab === 'habits' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Habit Coach
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-white font-medium shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white font-medium shadow-md'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Settings
          </button>
        </nav>

        {/* SIDEBAR COACH ADVICE CARD */}
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-indigo-400" />
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Proactive Coach</p>
            </div>
            <p className="text-xs text-slate-300 italic line-clamp-3 mt-1 leading-relaxed">
              {coachAdvice}
            </p>
            <button
              onClick={() => {
                setActiveTab('scheduler');
                handleTimerAction('play');
              }}
              className="mt-3.5 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Zap className="w-3.5 h-3.5" />
              Start Focus Session
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT CONTENT */}
      <main id="main-content-canvas" className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0C]">
        
        {/* UPPER HEADER */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#09090B]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">AI Optimizing Schedule</span>
            </div>
            {aiLoading && (
              <span className="text-xs text-slate-400 animate-pulse flex items-center gap-1.5 ml-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> Thinking...
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, priority, categories..."
                className="bg-slate-900/60 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 transition-all"
              />
            </div>
            
            {/* GAMIFIED LEVEL DISPLAY HEADER */}
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full shadow-sm">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-white">Level {level}</span>
              <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-1.5" style={{ width: `${(xp / (level * 100)) * 100}%` }}></div>
              </div>
            </div>

            {/* COACH VOICE CONTROLLER BAR */}
            <button
              onClick={toggleRealSpeechRecognition}
              className={`p-2 rounded-full relative transition-all ${voiceDictationActive ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}`}
              title="Voice commands: Speak to create tasks or ask scheduling details"
            >
              <Mic className="w-4 h-4" />
              {voiceDictationActive && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              JD
            </div>
          </div>
        </header>

        {/* MAIN BODY SCENE ROUTER */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* ==========================================
              TAB 1: INTERACTIVE DASHBOARD
             ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* TOP STATS CONTAINER */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Productivity Score Metric Card */}
                <div className="col-span-12 md:col-span-3 bg-slate-900/50 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Productivity Score</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-end gap-2 my-2">
                    <span className="text-4.5xl font-extrabold text-white leading-none tracking-tight">{productivityScore}</span>
                    <span className="text-emerald-400 text-xs mb-1 font-semibold flex items-center">
                      +12% vs last week
                    </span>
                  </div>
                  <div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full" style={{ width: `${productivityScore}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block">Calculated via completion velocity and focus minutes.</span>
                  </div>
                </div>

                {/* Deep Work Target Meter */}
                <div className="col-span-12 md:col-span-3 bg-slate-900/50 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Deep Work Focus</span>
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex items-end gap-2 my-2">
                    <span className="text-4.5xl font-extrabold text-white leading-none tracking-tight">{(focusMinutes / 60).toFixed(1)}h</span>
                    <span className="text-slate-400 text-xs mb-1 font-medium">/ 5h target</span>
                  </div>
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((idx) => {
                        const targetMinutesValue = idx * 60;
                        const filled = focusMinutes >= targetMinutesValue;
                        return (
                          <div 
                            key={idx} 
                            className={`h-4 flex-1 rounded-sm transition-all ${
                              filled ? 'bg-indigo-500/80 shadow-sm' : 'bg-slate-800'
                            }`}
                          ></div>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block">Finish Pomodoros to log focus times.</span>
                  </div>
                </div>

                {/* Critical AI Deadlines Banner */}
                <div className="col-span-12 md:col-span-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden shadow-lg">
                  <div className="z-10 max-w-[65%]">
                    <h3 className="text-white font-extrabold text-lg mb-1 leading-tight">Next Critical Deadline</h3>
                    {nextCriticalTask ? (
                      <>
                        <p className="text-indigo-100 opacity-90 text-xs font-semibold uppercase tracking-wider">{nextCriticalTask.title}</p>
                        <p className="text-indigo-100 text-xs mt-1">Due: {nextCriticalTask.deadline} | Estimated: {nextCriticalTask.duration} hours</p>
                        <button
                          onClick={() => toggleTask(nextCriticalTask.id)}
                          className="mt-3.5 bg-white text-indigo-700 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                        >
                          Complete Review Now
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-indigo-100 opacity-90 text-xs font-semibold uppercase tracking-wider">Schedule clear of High-urgency load!</p>
                        <p className="text-indigo-100 text-xs mt-1">AI Suggests: Review habit tracks or execute a 25-minute Pomodoro.</p>
                        <button
                          onClick={() => setActiveTab('tasks')}
                          className="mt-3.5 bg-white text-indigo-700 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
                        >
                          Explore Task Backlog
                        </button>
                      </>
                    )}
                  </div>
                  <div className="z-10 text-right">
                    <p className="text-indigo-200 text-[10px] uppercase font-extrabold tracking-widest mb-1">AI Progress Forecast</p>
                    <div className="text-2xl font-mono font-black text-white tracking-tighter">
                      {nextCriticalTask ? 'ACTION REQUIRED' : 'ON TRACK'}
                    </div>
                  </div>
                  <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
              </div>

              {/* LOWER ROW CONTENT: SCHEDULES & HABITS */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Proactive Schedule List */}
                <div className="col-span-12 lg:col-span-8 flex flex-col">
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex-1 flex flex-col backdrop-blur-md">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="font-bold text-white flex items-center gap-2.5">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        Proactive Adaptive Schedule
                      </h3>
                      <button
                        onClick={handleAIOptimize}
                        disabled={aiLoading}
                        className="text-xs bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/30 flex items-center gap-1.5 transition-all font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Optimize with AI
                      </button>
                    </div>

                    <div className="space-y-4">
                      {schedule.map((block, index) => {
                        const isNow = index === 0;
                        return (
                          <div 
                            key={block.id} 
                            className={`relative pl-8 border-l-2 py-1 transition-all ${
                              isNow ? 'border-indigo-500' : 'border-slate-800'
                            }`}
                          >
                            <div className={`absolute -left-[9px] top-2.5 w-4 h-4 rounded-full ring-4 ${
                              isNow ? 'bg-indigo-500 ring-indigo-500/20' : 'bg-slate-700 ring-transparent'
                            }`}></div>
                            
                            <div className={`border p-4 rounded-xl transition-all ${
                              isNow 
                                ? 'bg-indigo-500/10 border-indigo-500/30 shadow-md' 
                                : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-800/20'
                            }`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-xs font-bold ${isNow ? 'text-indigo-300' : 'text-slate-400'}`}>{block.time} {isNow && '(NOW)'}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  block.type === 'Deep Work' 
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                                    : block.type === 'Break' 
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                                      : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {block.type}
                                </span>
                              </div>
                              <p className="text-slate-200 font-semibold mt-1.5 text-sm">{block.title}</p>
                              {block.note && <p className="text-slate-400 text-xs mt-1.5 italic font-sans flex items-center gap-1"><Brain className="w-3.5 h-3.5 shrink-0 text-purple-400" /> {block.note}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Priorities & Habits sidebar combo */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Eisenhower Matrix Overview Card */}
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 flex flex-col backdrop-blur-md">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                      Eisenhower Priorities
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                        <p className="text-[9px] font-extrabold text-red-400 uppercase tracking-wider">Urgent + Imp</p>
                        <p className="text-xs font-semibold text-white mt-1 line-clamp-2 leading-snug">
                          {eisenhowerMatrix.urgentImportant[0] || 'No Urgent Tasks'}
                        </p>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5">
                        <p className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider">Strategic</p>
                        <p className="text-xs font-semibold text-white mt-1 line-clamp-2 leading-snug">
                          {eisenhowerMatrix.importantNotUrgent[0] || 'No Strategic Tasks'}
                        </p>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3.5">
                        <p className="text-[9px] font-extrabold text-orange-400 uppercase tracking-wider">Delegate</p>
                        <p className="text-xs font-semibold text-white mt-1 line-clamp-2 leading-snug">
                          {eisenhowerMatrix.urgentNotImportant[0] || 'No Delegated Items'}
                        </p>
                      </div>
                      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Routine</p>
                        <p className="text-xs font-semibold text-white mt-1 line-clamp-2 leading-snug">
                          {eisenhowerMatrix.routine[0] || 'No Routine Items'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Habits Quick Tracker Checklist */}
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 flex flex-col backdrop-blur-md flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-500" /> Habits
                      </h4>
                      <span className="text-[11px] text-emerald-400 font-mono">Streak: {Math.max(...habits.map(h => h.streak), 0)}d</span>
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {habits.slice(0, 4).map((h) => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const done = h.completedDays.includes(todayStr);
                        return (
                          <div key={h.id} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-850 rounded-xl hover:bg-slate-800/30 transition-all">
                            <span className="text-xs text-slate-300 font-medium">{h.title}</span>
                            <button
                              onClick={() => toggleHabit(h.id)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all border ${
                                done 
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-900' 
                                  : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                              }`}
                            >
                              {done && <Check className="w-4 h-4 stroke-[3px]" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* QUICK ADD FLOATING TASK BAR */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
                <Brain className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  placeholder="Quick add: e.g. Finalize Slide Deck for Venture capital..."
                  className="bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1 w-full"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={quickTaskPriority}
                    onChange={(e: any) => setQuickTaskPriority(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                  <select
                    value={quickTaskCategory}
                    onChange={(e: any) => setQuickTaskCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none"
                  >
                    <option value="Work">💼 Work</option>
                    <option value="Study">📚 Study</option>
                    <option value="Health">🧘 Health</option>
                    <option value="Personal">🏡 Personal</option>
                  </select>
                  <button
                    onClick={handleQuickTaskAdd}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-md shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Task
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 2: SMART TASK MANAGER
             ========================================== */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Smart Task Hub</h3>
                  <p className="text-xs text-slate-400 mt-1">AI monitors task difficulties, predicts completion probability, and schedules execution.</p>
                </div>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Detailed Task
                </button>
              </div>

              {/* DYNAMIC EXPANDABLE CREATE TASK MODAL */}
              {showTaskForm && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> Create Strategic Task Block
                    </h4>
                    <button onClick={() => setShowTaskForm(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateTaskSubmit} className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Task Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Research Papers on Deep Learning Architecture"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Sub-Description</label>
                      <input
                        type="text"
                        placeholder="Key milestones or focus points..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Category</label>
                      <select
                        value={newTask.category}
                        onChange={(e: any) => setNewTask({ ...newTask, category: e.target.value })}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="Work">💼 Work / Production</option>
                        <option value="Study">📚 Study / Research</option>
                        <option value="Health">🧘 Health / Recovery</option>
                        <option value="Personal">🏡 Personal / Admin</option>
                        <option value="Routine">🔄 Routine Daily</option>
                      </select>
                    </div>

                    <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e: any) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="High">🔴 High Priority</option>
                        <option value="Medium">🟡 Medium Priority</option>
                        <option value="Low">🟢 Low Priority</option>
                      </select>
                    </div>

                    <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Smart Deadline</label>
                      <input
                        type="text"
                        placeholder="e.g. Today 5 PM, Friday Night"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Difficulty & Hours</label>
                      <div className="flex gap-2">
                        <select
                          value={newTask.difficulty}
                          onChange={(e: any) => setNewTask({ ...newTask, difficulty: e.target.value })}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none flex-1"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={newTask.duration}
                          onChange={(e) => setNewTask({ ...newTask, duration: parseFloat(e.target.value) || 1 })}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-16 text-center"
                        />
                      </div>
                    </div>

                    <div className="col-span-12 flex justify-end gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(false)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
                      >
                        Schedule Task
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LIST OF FILTERED ACTIVE TASKS */}
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/20 border border-slate-850 rounded-2xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-75" />
                    <p className="text-slate-400 font-semibold text-sm mt-3">All caught up!</p>
                    <p className="text-slate-500 text-xs mt-1">Add details tasks or dictate voice milestones to begin.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        task.completed 
                          ? 'bg-slate-900/20 border-slate-850 opacity-60' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-750'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3.5">
                          {/* Checked Checkbox Circle */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-inner' 
                                : 'border-slate-600 bg-slate-950 hover:border-slate-400'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                          </button>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold text-slate-200 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                                {task.title}
                              </h4>
                              {task.priority === 'High' && (
                                <span className="bg-red-500/15 text-red-400 text-[9px] font-extrabold px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wider">High Priority</span>
                              )}
                              <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-700/60 uppercase">{task.category}</span>
                            </div>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{task.description}</p>
                          </div>
                        </div>

                        {/* Right side operational controls */}
                        <div className="flex flex-wrap items-center gap-2 sm:ml-auto w-full sm:w-auto justify-end">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-950 border border-slate-850/80 px-2 py-1 rounded-lg">Deadline: {task.deadline}</span>
                          
                          {/* AI Breakdown Button */}
                          {!task.completed && (
                            <button
                              onClick={() => handleAITaskBreakdown(task.id)}
                              disabled={breakingTaskId === task.id}
                              className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                            >
                              <Sparkles className={`w-3 h-3 text-indigo-400 ${breakingTaskId === task.id ? 'animate-spin' : ''}`} /> 
                              {breakingTaskId === task.id ? 'Structuring...' : 'AI Breakdown'}
                            </button>
                          )}

                          {/* Snooze/Procrastinate Tracker Rescheduler */}
                          {!task.completed && (
                            <button
                              onClick={() => rescheduleTask(task.id)}
                              className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                              title="Reschedule task. Warns after 3 delays."
                            >
                              <Clock className="w-3 h-3 text-orange-400" /> Snooze 
                              {task.delayedCount > 0 && <span className="text-orange-400 font-black">({task.delayedCount})</span>}
                            </button>
                          )}

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* AI GENERATED SUBTASKS CHECKLIST PANEL */}
                      {task.subtasks.length > 0 && (
                        <div className="mt-4 pl-8 border-t border-slate-800/80 pt-4 space-y-2 max-w-xl">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 mb-2.5">
                            <Brain className="w-3.5 h-3.5 text-purple-400" /> AI Task Breakdowns
                          </span>
                          {task.subtasks.map((st) => (
                            <div key={st.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/35 border border-slate-850 hover:bg-slate-950/60 transition-all">
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => toggleSubtask(task.id, st.id)}
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                    st.completed 
                                      ? 'bg-indigo-500 border-indigo-400 text-slate-950 shadow-inner' 
                                      : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                                  }`}
                                >
                                  {st.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                                </button>
                                <span className={`text-xs ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{st.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {st.duration && <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{st.duration}</span>}
                                {st.difficulty && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    st.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : st.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                                  }`}>
                                    {st.difficulty}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: SMART SCHEDULER & FOCUS TIMER
             ========================================== */}
          {activeTab === 'scheduler' && (
            <div className="space-y-6">
              <div className="grid grid-cols-12 gap-6">
                
                {/* 1. INTERACTIVE DETAILED TIMER & SYNTH CARD */}
                <div className="col-span-12 md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center items-center relative overflow-hidden backdrop-blur-md">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-4">Deep Work Focus Workspace</span>
                  
                  {/* Visual Countdown Timer */}
                  <div className="w-48 h-48 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center relative my-4 shadow-2xl bg-slate-900/80 animate-pulse">
                    <span className="text-4xl font-mono font-extrabold text-white tracking-tight">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1.5">
                      {timerMode === 'pomodoro' ? '🧠 FOCUS TIME' : '🧘 RECOVERY'}
                    </span>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex gap-1 bg-slate-950 border border-slate-850 p-1 rounded-xl w-full max-w-xs mt-3.5">
                    <button
                      onClick={() => handleTimerModeChange('pomodoro')}
                      className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${timerMode === 'pomodoro' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Pomodoro
                    </button>
                    <button
                      onClick={() => handleTimerModeChange('short_break')}
                      className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${timerMode === 'short_break' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Short Break
                    </button>
                    <button
                      onClick={() => handleTimerModeChange('long_break')}
                      className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${timerMode === 'long_break' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Long Break
                    </button>
                  </div>

                  {/* Operational Timer Controls */}
                  <div className="flex gap-3 mt-6">
                    {isTimerRunning ? (
                      <button
                        onClick={() => handleTimerAction('pause')}
                        className="bg-red-600 hover:bg-red-500 text-white p-3.5 rounded-full transition-all shadow-md"
                      >
                        <Pause className="w-5 h-5 fill-white" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTimerAction('play')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-full transition-all shadow-lg hover:scale-105"
                      >
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleTimerAction('reset')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3.5 rounded-full transition-all border border-slate-750"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* INTEGRATED BROWSER WHITE NOISE SYNTHESIZER PANEL */}
                  <div className="w-full border-t border-slate-800/80 mt-6 pt-5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3 text-center">Binaural & Noise Wave Synthesizer</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: '🔇 No Audio Synth' },
                        { id: 'rain', label: '🌧️ Heavy Rainfall' },
                        { id: 'ocean', label: '🌊 Oceanic Waves' },
                        { id: 'binaural', label: '🎧 Binaural focus' }
                      ].map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setActiveWhiteNoise(n.id as any);
                            showNotification(`🔊 Synth generated real-time sound waves: ${n.label.split(' ')[1]}`);
                          }}
                          className={`py-2 text-[10px] font-bold border rounded-xl transition-all ${
                            activeWhiteNoise === n.id 
                              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-md' 
                              : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-850 hover:text-white'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. CHRONOLOGICAL SMART PLAN AGENDA */}
                <div className="col-span-12 md:col-span-7 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col backdrop-blur-md">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-400" /> Hourly Focus Blocking
                    </h3>
                    <button
                      onClick={handleAIOptimize}
                      disabled={aiLoading}
                      className="text-xs bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Re-Optimize Blocks
                    </button>
                  </div>

                  <div className="space-y-4">
                    {schedule.map((block) => (
                      <div key={block.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex items-start gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center font-mono text-[10px] text-indigo-300 shrink-0 font-bold min-w-[120px]">
                          {block.time}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-200">{block.title}</h4>
                            <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase">{block.type}</span>
                          </div>
                          {block.note && <p className="text-slate-400 text-[11px] italic mt-1 font-sans">{block.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Manual Quick Agenda Builder Form */}
                  <div className="border-t border-slate-800/80 mt-6 pt-5 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Insert Custom Time Block</span>
                    <div className="grid grid-cols-12 gap-3">
                      <input
                        type="text"
                        placeholder="e.g. 2:00 PM - 3:30 PM"
                        id="new-block-time"
                        className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 col-span-4"
                      />
                      <input
                        type="text"
                        placeholder="Milestone description..."
                        id="new-block-title"
                        className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 col-span-5"
                      />
                      <button
                        onClick={() => {
                          const timeVal = (document.getElementById('new-block-time') as HTMLInputElement)?.value;
                          const titleVal = (document.getElementById('new-block-title') as HTMLInputElement)?.value;
                          if (timeVal && titleVal) {
                            setSchedule([...schedule, { id: `block-${Date.now()}`, time: timeVal, title: titleVal, type: 'Task', note: 'Manually logged.' }]);
                            (document.getElementById('new-block-time') as HTMLInputElement).value = '';
                            (document.getElementById('new-block-title') as HTMLInputElement).value = '';
                            showNotification('📝 Block added to chronological schedule.');
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg col-span-3 transition-colors py-2"
                      >
                        Add Block
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: HABIT COACH
             ========================================== */}
          {activeTab === 'habits' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Interactive Habit Tracker</h3>
                  <p className="text-xs text-slate-400 mt-1">Streaks unlock milestones, grant passive multiplier boosts, and enhance focus score algorithms.</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="new-habit-title"
                    placeholder="New routine title (e.g. Drink 3L Water)..."
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
                  />
                  <button
                    onClick={() => {
                      const inputEl = document.getElementById('new-habit-title') as HTMLInputElement;
                      if (inputEl && inputEl.value.trim()) {
                        handleCreateHabit(inputEl.value, 'Health');
                        inputEl.value = '';
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
                  >
                    Track Habit
                  </button>
                </div>
              </div>

              {/* GRID OF HABITS WITH DETAILED CALENDAR MATRIX */}
              <div className="grid grid-cols-12 gap-6">
                {habits.map((h) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const doneToday = h.completedDays.includes(todayStr);
                  
                  return (
                    <div key={h.id} className="col-span-12 md:col-span-6 bg-slate-900/50 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-slate-200 leading-tight">{h.title}</h4>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold mt-1 inline-block">{h.category}</span>
                          </div>
                          
                          {/* Streak Badge */}
                          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-2.5 py-1 rounded-full text-xs">
                            <Flame className="w-3.5 h-3.5" />
                            <span>{h.streak}d Streak</span>
                          </div>
                        </div>

                        {/* Visual Heatmap representation of last 7 days */}
                        <div className="mt-5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Completion History (Last 7 Days)</span>
                          <div className="flex gap-2.5">
                            {[6, 5, 4, 3, 2, 1, 0].map((offset) => {
                              const d = new Date();
                              d.setDate(d.getDate() - offset);
                              const dateStr = d.toISOString().split('T')[0];
                              const isCompleted = h.completedDays.includes(dateStr);
                              const isToday = offset === 0;

                              return (
                                <div 
                                  key={offset} 
                                  className="flex-1 flex flex-col items-center gap-1"
                                  title={`${d.toLocaleDateString()}: ${isCompleted ? 'Completed' : 'Missed'}`}
                                >
                                  <div className={`w-full aspect-square rounded-lg border transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-500 border-emerald-400 shadow-sm' 
                                      : 'bg-slate-950 border-slate-800'
                                  }`}></div>
                                  <span className={`text-[8px] font-mono font-bold ${isToday ? 'text-indigo-400 font-black' : 'text-slate-500'}`}>
                                    {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-850 mt-5 pt-4 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">Total days complete: {h.completedDays.length}</span>
                        <button
                          onClick={() => toggleHabit(h.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 active:scale-95 ${
                            doneToday 
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {doneToday ? 'Completed Today' : 'Log Daily Progress'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 5: ANALYTICS & REPORTS
             ========================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Intelligence Analytics Panel</h3>
                  <p className="text-xs text-slate-400 mt-1">Review visual trends, focus consistency ratios, and download customized performance audit sheets.</p>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" /> Download Performance Audit
                </button>
              </div>

              {/* GRID OF COMPLETED METRICS */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Visual completion stats graph panel */}
                <div className="col-span-12 md:col-span-8 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col backdrop-blur-md">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Focus Hour Trends (Last 7 Days)</span>
                  
                  {/* Custom CSS Bar Graph */}
                  <div className="h-60 flex items-end gap-3.5 border-b border-l border-slate-800/80 p-4 pt-10">
                    {[
                      { day: 'Mon', focus: 120, target: 150 },
                      { day: 'Tue', focus: 180, target: 150 },
                      { day: 'Wed', focus: 90, target: 150 },
                      { day: 'Thu', focus: 210, target: 150 },
                      { day: 'Fri', focus: 160, target: 150 },
                      { day: 'Sat', focus: 45, target: 150 },
                      { day: 'Sun', focus: focusMinutes, target: 150 }
                    ].map((d, index) => {
                      const pct = Math.min(100, (d.focus / 240) * 100);
                      return (
                        <div key={index} className="flex-1 h-full flex flex-col justify-end items-center gap-2 relative group">
                          
                          {/* Custom visual tooltips */}
                          <div className="absolute bottom-full mb-2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none min-w-[75px] text-center shadow-lg">
                            <span className="text-indigo-400 block">{d.focus} mins</span>
                            <span className="text-slate-500">Target: {d.target}</span>
                          </div>

                          <div className="w-full bg-slate-950 rounded-t-lg flex-1 flex flex-col justify-end overflow-hidden">
                            <div 
                              className="bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-700"
                              style={{ height: `${pct}%` }}
                            ></div>
                          </div>
                          
                          <span className="text-[10px] font-mono font-bold text-slate-500">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* GAMIFIED LEADERBOARDS & MILESTONE BADGES */}
                <div className="col-span-12 md:col-span-4 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col backdrop-blur-md">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4">
                    <Award className="w-4 h-4 text-indigo-400" /> Milestone Badges
                  </h4>
                  
                  <div className="space-y-3.5 flex-1">
                    {achievements.map((ach) => (
                      <div 
                        key={ach.id} 
                        className={`p-3.5 rounded-xl border transition-all flex gap-3 items-center ${
                          ach.unlocked 
                            ? 'bg-indigo-500/5 border-indigo-500/25 shadow-sm' 
                            : 'bg-slate-950/40 border-slate-850 opacity-60'
                        }`}
                      >
                        <div className="text-2xl">{ach.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-slate-200">{ach.title}</h5>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${ach.unlocked ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                              {ach.unlocked ? 'UNLOCKED' : `+${ach.xpReward} XP`}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10px] mt-0.5">{ach.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              TAB 6: PREFERENCES & SETTINGS
             ========================================== */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6 max-w-2xl backdrop-blur-md">
              <div>
                <h3 className="text-lg font-bold text-white">ProActive Engine Configurations</h3>
                <p className="text-xs text-slate-400 mt-1">Configure your personalized assistant details, sound profiles, and cognitive coach rules.</p>
              </div>

              <div className="space-y-4">
                {/* Coaching tone selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Coaching Conversation Tone</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'empathic', label: '🤝 Empathic & Gentle', desc: 'Encouraging, highlights small wins.' },
                      { id: 'direct', label: '💼 Direct & Analytical', desc: 'Focuses strictly on scheduled milestones.' },
                      { id: 'aggressive', label: '🔥 High Motivation', desc: 'Direct alerts, highlights procrastination risks.' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCoachingTone(t.id as any);
                          showNotification(`Tone switched: Coach will now address you in ${t.label.split(' ')[1]} tone.`);
                        }}
                        className={`p-3.5 border rounded-xl text-left transition-all flex flex-col justify-between ${
                          coachingTone === t.id 
                            ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800/20'
                        }`}
                      >
                        <span className="text-xs font-bold text-white">{t.label}</span>
                        <span className="text-[9px] text-slate-500 mt-1 leading-relaxed">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Timezone picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">System Timezone</label>
                    <select className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none">
                      <option>UTC -07:00 (Pacific Time)</option>
                      <option>UTC +00:00 (Greenwich Mean Time)</option>
                      <option>UTC +05:30 (Indian Standard Time)</option>
                      <option>UTC +08:00 (Singapore Standard Time)</option>
                    </select>
                  </div>

                  {/* Integration setups */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Interactive Sync Options</label>
                    <button 
                      onClick={() => showNotification('🔗 Simulated Calendar integration successfully authorized!')}
                      className="bg-slate-950 border border-slate-850 text-slate-300 hover:text-white hover:border-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      Authorize Google Calendar Sync
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-5 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Need to reload backup algorithms?</span>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    Reset Factory Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FLOATING AI CHAT DRAWER */}
      {isChatOpen && (
        <div id="ai-chat-drawer" className="w-80 border-l border-slate-800 bg-[#09090B] flex flex-col shrink-0 h-full shadow-2xl z-40 animate-fade-in">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#09090B]/90">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-xs text-slate-200 uppercase tracking-widest">Coaching Channel</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHAT MESSAGES WINDOW */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/20">
            {chatMessages.map((m, idx) => {
              const model = m.role === 'model';
              return (
                <div key={idx} className={`flex ${model ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    model 
                      ? 'bg-slate-900 border border-slate-800 text-slate-200' 
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {m.parts[0].text}
                  </div>
                </div>
              );
            })}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 italic flex items-center gap-1.5 shadow-sm">
                  <Sparkle className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> Coach is reviewing scheduling parameters...
                </div>
              </div>
            )}
          </div>

          {/* CHAT ACTION INPUT BAR */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 flex gap-2">
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
              placeholder="Ask coach to optimize schedules..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1"
            />
            <button
              onClick={handleChatSend}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING AI ASSISTANT CHAT TRIGGER */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer group z-30"
          title="Open AI companion coach chat"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#09090B]"></div>
        </button>
      )}

    </div>
  );
}
