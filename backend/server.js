const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/spanish-chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [{
        text: String,
        isAi: Boolean,
        timestamp: { type: Date, default: Date.now }
    }],
    title: { type: String, default: 'New Chat' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Chat = mongoose.model('Chat', ChatSchema);

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '24h' });
        res.json({ token, username });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.id });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching chats' });
    }
});

app.post('/api/chat', authenticateToken, async (req, res) => {
    try {
        const { message, chatId } = req.body;
        let chat;

        if (chatId) {
            chat = await Chat.findById(chatId);
        } else {
            chat = new Chat({ userId: req.user.id });
        }

        chat.messages.push({
            text: message,
            isAi: false
        });

        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'mistral',
            messages: [{
                role: "system",
                content: "You are a native spanish speaker named Hozie and a friend of the user. Make conversation with the user and always respond in latin american style Spanish. Do not use english unless explicitly asked to translate. If the user makes a mistake correct them. Keep your messages around two sentences unless you are asked to explain something in more detail."
            }, {
                role: "user",
                content: message
            }],
            stream: false
        });

        chat.messages.push({
            text: response.data.message.content,
            isAi: true
        });

        await chat.save();
        res.json({
            response: response.data.message.content,
            chatId: chat._id
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});