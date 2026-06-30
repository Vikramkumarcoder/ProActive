import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Server-side proactive AI Assistant endpoint
  app.post('/api/ai-action', async (req, res) => {
    try {
      const { action, payload } = req.body;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY environment variable is not configured. Please add it via Settings > Secrets.',
        });
      }

      let prompt = '';

      if (action === 'chat') {
        const { message, history } = payload;
        const systemInstruction = `You are ProActive AI, an empathetic, highly intelligent, and direct proactive productivity assistant and personal success coach. 
Your goal is to help students, professionals, and entrepreneurs complete tasks before deadlines are missed instead of just listing them.
Be action-oriented, encouraging, yet analytical. Identify procrastination patterns, suggest time-boxing, and focus on breaking large projects into small, non-intimidating steps.
Keep responses concise, styled in Markdown, and directly applicable.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [...history, { role: 'user', parts: [{ text: message }] }],
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        return res.json({ text: response.text });
      }

      if (action === 'suggest-schedule') {
        const { tasks, habits } = payload;
        prompt = `Analyze these tasks and habits, and generate a proactive optimized schedule for today.
Identify high-priority work, warn about unrealistic timelines or overloaded slots, detect procrastination, and suggest deep work sessions.

Tasks:
${JSON.stringify(tasks, null, 2)}

Habits:
${JSON.stringify(habits, null, 2)}

Respond with a raw JSON structure ONLY, containing:
{
  "schedule": [
    { "time": "9:00 AM - 11:30 AM", "title": "...", "type": "Deep Work" | "Break" | "Task" | "Routine", "note": "..." }
  ],
  "coachMessage": "...", // friendly, proactive, customized coaching message addressing specific tasks
  "matrix": {
    "urgentImportant": ["Task Title 1", ...],
    "importantNotUrgent": [...],
    "urgentNotImportant": [...],
    "routine": [...]
  },
  "productivityScore": 85 // estimated productivity score (0-100) based on schedule balance
}

Ensure the response is valid JSON and contains NO markdown wrappers or code block formatting (i.e. no \`\`\`json).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        return res.json(JSON.parse(response.text || '{}'));
      }

      if (action === 'breakdown-task') {
        const { task } = payload;
        prompt = `Break down this task into 3 to 6 highly actionable, smaller subtasks. Detail durations and difficulty.
Task: ${JSON.stringify(task)}

Respond with a raw JSON structure ONLY, containing:
{
  "subtasks": [
    { "title": "...", "duration": "...", "difficulty": "Easy" | "Medium" | "Hard" }
  ]
}

Ensure the response is valid JSON and contains NO markdown wrappers or code block formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        return res.json(JSON.parse(response.text || '{}'));
      }

      if (action === 'parse-voice') {
        const { text } = payload;
        prompt = `The user said: "${text}".
Identify if they want to create a task, schedule a habit, or if they are asking a coaching question.
Extract parameters such as title, category, priority, relative deadline, and duration.

Respond with a raw JSON structure ONLY, containing:
{
  "intent": "create_task" | "create_habit" | "general_chat",
  "data": {
    "title": "...", // title of task/habit (or empty)
    "category": "Work" | "Study" | "Health" | "Personal" | "Routine",
    "priority": "High" | "Medium" | "Low",
    "deadline": "...", // relative/absolute description (e.g., "Friday", "Tomorrow at 6pm")
    "estimatedDuration": "..." // e.g. "2 hours"
  },
  "coachResponse": "..." // verbal coach comment explaining what is being actioned
}

Ensure the response is valid JSON and contains NO markdown wrappers or code block formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        return res.json(JSON.parse(response.text || '{}'));
      }

      return res.status(400).json({ error: 'Unknown action requested.' });
    } catch (error: any) {
      console.error('Gemini API proxy error:', error);
      res.status(500).json({ error: error.message || 'Internal AI Server Error' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';

  if (!isProd) {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Robust dev mode fallback to serve and transform index.html
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // Serve client static build
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[ProActive AI] Express full-stack server running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
