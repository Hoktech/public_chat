import React, { useState, useEffect } from 'react';
import MessageList from './components/MessageList';
import './styles.css';

function App() {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const response = await fetch('/.netlify/functions/messages');
    const data = await response.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/.netlify/functions/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, message, type: 'text' })
    });
    setMessage('');
    fetchMessages();
  };

  return (
    <div className="App">
      <h1>تطبيق الشات</h1>
      <MessageList messages={messages} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="الاسم المستعار"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="أدخل رسالتك"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">إرسال</button>
      </form>
    </div>
  );
}

export default App;
