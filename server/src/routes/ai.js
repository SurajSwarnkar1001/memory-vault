import express from 'express';
import { protect } from '../middleware/auth.js';

import Entry from '../models/Entry.js';
import Project from '../models/Project.js';

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Send a message history to the AI and get a response
router.post('/chat', protect, async (req, res) => {
  try {
    const { messages, projectId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    let systemPrompt = 'You are a helpful AI assistant integrated into a workspace app called Memory Vault. Be concise, smart, and helpful.';

    // If projectId is provided, fetch project context
    if (projectId) {
      // Verify user has access to project
      const project = await Project.findOne({ 
        _id: projectId, 
        $or: [{ userId: req.user.id }, { members: req.user.id }] 
      });

      if (project) {
        // Extract the latest user question to use as a search query
        const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content || '';
        
        let entries = [];
        if (lastUserMessage.trim()) {
          // Try text search first
          entries = await Entry.find(
            { projectId, $text: { $search: lastUserMessage } },
            { score: { $meta: 'textScore' } }
          ).sort({ score: { $meta: 'textScore' } }).limit(5);
        }

        // Fallback to recent entries if no search matches
        if (entries.length === 0) {
          entries = await Entry.find({ projectId }).sort({ entryDate: -1 }).limit(5);
        }

        if (entries.length > 0) {
          const contextString = entries.map(e => 
            `[Date: ${new Date(e.entryDate).toISOString().split('T')[0]}] ${e.title ? `Title: ${e.title}` : ''} \nContent: ${e.textContent || 'No text content'}`
          ).join('\n\n');

          systemPrompt = `You are a helpful AI assistant for the project "${project.name}". 
The user is asking a question about their project. 
Here is some relevant data retrieved from their project vault:

${contextString}

Based ONLY on the context above and your general knowledge, answer the user's question. If the answer is not in the context, you can still answer normally but clarify that it's not from the project notes.`;
        }
      }
    }

    const url = process.env.OLLAMA_API_URL || 'https://cell-neck-nominated-automobile.trycloudflare.com/v1/chat/completions';
    const apiKey = process.env.OLLAMA_API_KEY || 'ollama';
    const modelName = process.env.OLLAMA_MODEL || 'qwen3.8-27b-uncensored-mtp';

    // Prepend system message
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
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
