import React, { useState } from 'react';

const SpanishPracticeChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu compañero de práctica español. ¿Cómo estás hoy?",
      isAi: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: 'User' + Math.floor(Math.random() * 1000).toString()
        }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return "Lo siento, hubo un error. Por favor, intenta de nuevo.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isAi: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    const aiResponse = await sendMessage(inputText);

    const aiMessage = {
      id: messages.length + 2,
      text: aiResponse,
      isAi: true
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const containerStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '1rem',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  };

  const chatContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '1rem',
    marginBottom: '1rem'
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    marginBottom: '1rem'
  };

  const formStyle = {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem'
  };

  const inputStyle = {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none',
    fontSize: '1rem'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  };

  const messageStyle = (isAi) => ({
    marginBottom: '1rem',
    textAlign: isAi ? 'left' : 'right'
  });

  const messageBubbleStyle = (isAi) => ({
    display: 'inline-block',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    maxWidth: '80%',
    wordWrap: 'break-word',
    backgroundColor: isAi ? '#dbeafe' : '#dcfce7',
    color: isAi ? '#1e40af' : '#166534'
  });

  return (
    <div style={containerStyle}>
      <div style={chatContainerStyle}>
        <div style={messagesContainerStyle}>
          {messages.map((message) => (
            <div key={message.id} style={messageStyle(message.isAi)}>
              <div style={messageBubbleStyle(message.isAi)}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={inputStyle}
            placeholder="Escribe tu mensaje aquí..."
            disabled={isLoading}
          />
          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SpanishPracticeChat;