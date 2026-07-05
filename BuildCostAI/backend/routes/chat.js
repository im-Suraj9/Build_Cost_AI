const express = require('express');
const { auth } = require('../middleware/auth');
const { chatbotResponse } = require('../services/aiService');

const router = express.Router();

const GROQ_SYSTEM_PROMPT = `You are an expert construction cost consultant specializing in Indian residential and commercial buildings. 

Your expertise includes:
- Construction cost estimation for all Indian cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, etc.)
- Material recommendations (cement brands like Ultratech/ACC/Ambuja, TMT steel like TATA Tiscon/JSW, tiles, etc.)
- Construction timelines and phase planning
- Cost optimization strategies tailored to Indian market
- Building regulations, soil types, and local construction practices
- Waterproofing, structural advice, MEP (mechanical, electrical, plumbing) guidance

Always:
- Use Indian Rupees (₹) for all cost references
- Give practical, actionable advice specific to India
- Mention specific Indian brands when relevant
- Format responses with clear sections using markdown
- Be concise but thorough
- Include tips that can save 15–25% on construction costs`;

router.post('/message', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Try Groq if configured
    if (process.env.GROQ_API_KEY) {
      try {
        const axios = require('axios');

        // Build messages array with conversation history
        const messages = [
          { role: 'system', content: GROQ_SYSTEM_PROMPT },
          // Include last 6 messages of history for context
          ...history.slice(-6).map(h => ({
            role: h.role === 'bot' ? 'assistant' : 'user',
            content: h.content
          })),
          { role: 'user', content: message }
        ];

        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: process.env.GROQ_MODEL || 'llama3-8b-8192',
            messages,
            max_tokens: 700,
            temperature: 0.7,
            top_p: 0.9,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        const aiText = response.data.choices[0]?.message?.content || '';

        return res.json({
          response: aiText,
          suggestions: generateFollowUps(message),
          model: response.data.model,
          powered_by: 'groq'
        });
      } catch (groqErr) {
        console.error('Groq API error:', groqErr.response?.data || groqErr.message);
        // Fall through to mock
      }
    }

    // Fallback: built-in mock responses
    const result = chatbotResponse(message);
    res.json({ ...result, powered_by: 'mock' });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Chat service error' });
  }
});

// Generate contextual follow-up suggestions based on user message
function generateFollowUps(message) {
  const msg = message.toLowerCase();
  if (msg.includes('cost') || msg.includes('price') || msg.includes('budget'))
    return ['How to reduce construction cost?', 'What affects cost the most?', 'Compare basic vs premium quality'];
  if (msg.includes('material') || msg.includes('cement') || msg.includes('steel'))
    return ['Best cement brands in India?', 'How much steel is needed per sqft?', 'AAC blocks vs red bricks?'];
  if (msg.includes('time') || msg.includes('duration') || msg.includes('schedule'))
    return ['What are the construction phases?', 'How to speed up construction?', 'Best season to start building?'];
  if (msg.includes('foundation') || msg.includes('structure') || msg.includes('soil'))
    return ['When to use raft foundation?', 'Soil testing importance?', 'Best concrete grade for columns?'];
  if (msg.includes('water') || msg.includes('leak') || msg.includes('damp'))
    return ['Best waterproofing products?', 'Terrace waterproofing methods?', 'Waterproofing cost estimate?'];
  return ['How to reduce construction cost?', 'Best materials to use?', 'How long will construction take?'];
}

module.exports = router;
