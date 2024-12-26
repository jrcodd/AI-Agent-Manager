const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const conversations = new Map();

app.post('/api/chat', async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!conversations.has(userId)) {
            conversations.set(userId, [
                {
                    role: "system",
                    content: "You are a native spanish speaker named Hozie and a friend of the user. Make conversation with the user and always respond in latin american style Spanish. Do not use english unless explicitly asked to translate. If the user makes a mistake correct them. Keep your messages around two sentences unless you are asked to explain something in more detail."
                }
            ]);
        }

        const conversationHistory = conversations.get(userId);

        conversationHistory.push({
            role: "user",
            content: message
        });

        // Call Ollama API (running locally)
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'mistral',
            messages: conversationHistory,
            stream: false
        });

        const aiResponse = response.data.message.content;

        conversationHistory.push({
            role: "assistant",
            content: aiResponse
        });

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});