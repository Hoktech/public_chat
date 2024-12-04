const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(express.json()); // لدعم بيانات JSON
app.use(cors());

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb+srv://hok:6pG3wMvFCkj5oPQl@chat.5der7.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// تعريف نموذج الرسائل
const messageSchema = new mongoose.Schema({
    message: String,
    nickname: String,
    ip: String,
    audio: Buffer,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API للحصول على جميع الرسائل
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// API لإرسال رسالة جديدة
app.post('/api/messages', async (req, res) => {
    try {
        const { message, nickname, type } = req.body;

        // الحصول على IP الخارجي
        const response = await axios.get('https://api.ipify.org?format=json');
        const externalIp = response.data.ip;

        let newMessage;

        if (type === 'audio') {
            const audioBuffer = Buffer.from(message, 'base64');
            newMessage = new Message({ nickname, ip: externalIp, audio: audioBuffer });
        } else {
            newMessage = new Message({ message, nickname, ip: externalIp });
        }

        await newMessage.save();
        
        // بث الرسالة للمستخدمين المتصلين عبر WebSocket
        io.emit('receive_message', { message, nickname, type });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// التعامل مع الاتصالات اللحظية باستخدام Socket.io
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// تشغيل الخادم
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
