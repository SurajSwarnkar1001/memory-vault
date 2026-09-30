import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Send a message history to the AI and get a response
router.post('/chat', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    const url = process.env.OLLAMA_API_URL || 'https://cell-neck-nominated-automobile.trycloudflare.com/v1/chat/completions';
    const apiKey = process.env.OLLAMA_API_KEY || 'ollama';
    const modelName = process.env.OLLAMA_MODEL || 'qwen3.8-27b-uncensored-mtp';

    // Prepend system message
    const formattedMessages = [
      { role: 'system', content: 'You are a helpful AI assistant integrated into a workspace app called Memory Vault. Be concise, smart, and helpful.' },
      ...messages
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    res.json({ response: aiMessage });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI' });
  }
});

export default router;
