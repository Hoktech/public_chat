const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // استيراد axios
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
// الاتصال بقاعدة البيانات
mongoose.connect('mongodb+srv://hok:6pG3wMvFCkj5oPQl@chat.5der7.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// تعريف نموذج الرسائل
const messageSchema = new mongoose.Schema({
    message: String,           // النص
    nickname: String,          // الاسم المستعار
    ip: String,                // عنوان الـ IP
    audio: Buffer,             // البيانات الصوتية بصيغة Base64
    timestamp: { type: Date, default: Date.now } // تاريخ ووقت الرسالة
});
const Message = mongoose.model('Message', messageSchema);
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('send_message', async (data) => {
        try {
            // الحصول على IP الخارجي باستخدام خدمة ipify
            const response = await axios.get('https://api.ipify.org?format=json');
            const externalIp = response.data.ip;
            // حفظ الرسائل الصوتية
            if (data.type === 'audio') {
                const audioBuffer = Buffer.from(data.message, 'base64'); // تحويل البيانات الصوتية من Base64 إلى Buffer
                const newMessage = new Message({
                    nickname: data.nickname,
                    ip: externalIp,
                    audio: audioBuffer // حفظ البيانات الصوتية
                });
                await newMessage.save();
            } else {
                // حفظ الرسائل النصية
                const newMessage = new Message({
                    message: data.message,
                    nickname: data.nickname,
                    ip: externalIp
                });
                await newMessage.save();
            }
            io.emit('receive_message', data); // بث الرسالة لجميع المستخدمين
        } catch (error) {
            console.error('Error fetching external IP:', error);
        }
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});