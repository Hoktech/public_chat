const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect('mongodb+srv://hok:6pG3wMvFCkj5oPQl@chat.5der7.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const messageSchema = new mongoose.Schema({
  message: String,
  nickname: String,
  ip: String,
  audio: Buffer,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    try {
      const messages = await Message.find().sort({ timestamp: -1 });
      return {
        statusCode: 200,
        body: JSON.stringify(messages),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch messages' }),
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const { message, nickname, type } = JSON.parse(event.body);
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
      return {
        statusCode: 201,
        body: JSON.stringify(newMessage),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save message' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};
