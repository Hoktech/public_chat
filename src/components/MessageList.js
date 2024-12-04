import React from 'react';

function MessageList({ messages }) {
  return (
    <div id="messages">
      {messages.map((msg) => (
        <div key={msg._id} className="message">
          <strong>{msg.nickname}:</strong> {msg.message || 'رسالة صوتية'}
        </div>
      ))}
    </div>
  );
}

export default MessageList;
