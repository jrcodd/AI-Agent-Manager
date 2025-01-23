import React, { useState, useEffect } from 'react';
import { MessageCircle, LogOut, Plus, Send, Trash2 } from 'lucide-react';

const AiChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const [models, setModels] = useState([]);
  const [currentModelId, setCurrentModelId] = useState(null);
  const [newModelName, setNewModelName] = useState('');
  const [newModelModel, setNewModelModel] = useState('');
  const [newModelSystemPrompt, setNewModelSystemPrompt] = useState('');
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [modelToDownload, setModelToDownload] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const colors = {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    background: '#F3F4F6',
    white: '#FFFFFF',
    gray: '#6B7280',
    lightGray: '#E5E7EB',
    success: '#10B981',
    danger: '#EF4444',
    text: '#1F2937',
    lightText: '#4B5563'
  };

  const styles = {
    mainContainer: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      fontFamily: "'Inter', sans-serif",
    },

    loginPage: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: colors.background,
    },

    loginCard: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: colors.white,
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },

    appContainer: {
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      height: '100vh',
    },

    header: {
      backgroundColor: colors.white,
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${colors.lightGray}`,
    },

    mainContent: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      overflow: 'hidden',
    },

    sidebar: {
      backgroundColor: colors.white,
      borderRight: `1px solid ${colors.lightGray}`,
      display: 'flex',
      flexDirection: 'column',
    },

    sidebarHeader: {
      padding: '1rem',
      borderBottom: `1px solid ${colors.lightGray}`,
    },

    chatsList: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
    },

    chatItem: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },

    chatArea: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto', // Enable vertical scrolling
      padding: '1.5rem',
      backgroundColor: colors.background,
      maxHeight: 'calc(100vh - 200px)', // Set a max height to ensure scrolling works
    },

    inputArea: {
      padding: '1rem 1.5rem',
      backgroundColor: colors.white,
      borderTop: `1px solid ${colors.lightGray}`,
    },

    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },

    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      border: `1px solid ${colors.lightGray}`,
      marginBottom: '1rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    },

    progressBar: {
      width: '100%',
      height: '10px',
      backgroundColor: colors.lightGray,
      borderRadius: '5px',
      marginTop: '1rem',
      overflow: 'hidden',
    },

    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: '5px',
      transition: 'width 0.3s ease',
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/models', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const deleteButton = {
    ...styles.button,
    padding: '0.5rem',
    backgroundColor: 'transparent',
    color: colors.danger,
    opacity: 0.7,
    ':hover': {
      opacity: 1,
    }
  };
  const chatItem = {
    ...styles.chatItem,
    justifyContent: 'space-between',
  };
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:3001/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setMessages([]);
        }
        fetchChats();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const messageBubble = (isAi) => ({
    maxWidth: '70%',
    padding: '1rem',
    borderRadius: '16px',
    backgroundColor: isAi ? colors.white : colors.primary,
    color: isAi ? colors.text : colors.white,
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    alignSelf: isAi ? 'flex-start' : 'flex-end',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchChats();
      fetchModels();
    }
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleLogout = async (e) => {
    try {
      e.preventDefault();
      localStorage.removeItem('token');
      setMessages([]);
      setCurrentChatId(null);
      setChats([]);
      setIsLoggedIn(false);
    }
    catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        fetchChats();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      handleLogin(e);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const checkModelInstalled = async (modelName) => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      const installedModels = data.models.map(model => model.name);
      return installedModels.includes(modelName);
    } catch (error) {
      console.error('Error checking model installation:', error);
      return false;
    }
  };

  const downloadModel = async (modelName) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: true })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let progress = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          const data = JSON.parse(line);
          if (data.status === 'downloading') {
            progress = data.completed / data.total;
            setDownloadProgress(progress * 100);
          }
        }
      }

      setIsDownloading(false);
      setShowDownloadModal(false);
      setModelToDownload(null);
    } catch (error) {
      console.error('Error downloading model:', error);
      setIsDownloading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !currentModelId) return;

    setIsLoading(true);
    try {
      const aiModel = models.find(model => model._id === currentModelId);
      if (!aiModel) {
        throw new Error('AI model not found');
      }

      const isInstalled = await checkModelInstalled(aiModel.modelName);
      if (!isInstalled) {
        setModelToDownload(aiModel.modelName);
        setShowDownloadModal(true);
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputText,
          chatId: currentChatId,
          modelId: currentModelId
        })
      });

      const data = await response.json();
      if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
      }

      setMessages(prev => [
        ...prev,
        { text: inputText, isAi: false },
        { text: data.response, isAi: true }
      ]);
      setInputText('');
      fetchChats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadModel = async () => {
    await downloadModel(modelToDownload);
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newModelName,
          modelName: newModelModel,
          systemPrompt: newModelSystemPrompt
        })
      });
      const newModel = await response.json();
      setModels(prev => [...prev, newModel]);
      setIsAddModelModalOpen(false);
      setNewModelName('');
      setNewModelModel('');
      setNewModelSystemPrompt('');
    } catch (error) {
      console.error('Error creating model:', error);
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      await fetch(`http://localhost:3001/api/models/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setModels(prev => prev.filter(model => model._id !== modelId));
      if (currentModelId === modelId) {
        setCurrentModelId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const renderSidebar = () => (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <button
          onClick={() => {
            setCurrentChatId(null);
            setMessages([]);
          }}
          style={{
            ...styles.button,
            backgroundColor: colors.primary,
            color: colors.white,
            width: '100%',
          }}
        >
          <Plus size={18} />
          New Chat
        </button>
        <button
          onClick={() => setIsAddModelModalOpen(true)}
          style={{
            ...styles.button,
            backgroundColor: colors.success,
            color: colors.white,
            width: '100%',
            marginTop: '0.5rem'
          }}
        >
          <Plus size={18} />
          Add AI Model
        </button>
      </div>
      <div style={styles.chatsList}>
        <h3 style={{ padding: '0 1rem', color: colors.text }}>AI Models</h3>
        {models.map(model => (
          <div
            key={model._id}
            onClick={() => {
              setCurrentModelId(model._id);
              setCurrentChatId(null);
              setMessages([]);
            }}
            style={{
              ...chatItem,
              backgroundColor: currentModelId === model._id ? colors.primary + '15' : 'transparent',
              color: currentModelId === model._id ? colors.primary : colors.text,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageCircle size={18} />
              <span>{model.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteModel(model._id);
              }}
              style={deleteButton}
              title="Delete model"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddModelModal = () => {
    if (!isAddModelModalOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          ...styles.loginCard,
          width: '500px',
          maxHeight: '90%',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginBottom: '1rem', color: colors.text }}>Add New AI Model</h2>
          <form onSubmit={handleCreateModel}>
            <input
              type="text"
              placeholder="Model Name"
              style={styles.input}
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Ollama Model Name (e.g., mistral, llama2)"
              style={styles.input}
              value={newModelModel}
              onChange={(e) => setNewModelModel(e.target.value)}
              required
            />
            <textarea
              placeholder="System Prompt (Optional)"
              style={{
                ...styles.input,
                minHeight: '100px',
                resize: 'vertical'
              }}
              value={newModelSystemPrompt}
              onChange={(e) => setNewModelSystemPrompt(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  backgroundColor: colors.primary,
                  color: colors.white,
                  flex: 1,
                }}
              >
                Create Model
              </button>
              <button
                type="button"
                onClick={() => setIsAddModelModalOpen(false)}
                style={{
                  ...styles.button,
                  backgroundColor: colors.lightGray,
                  color: colors.text,
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDownloadModal = () => {
    if (!showDownloadModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          ...styles.loginCard,
          width: '500px',
          maxHeight: '90%',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginBottom: '1rem', color: colors.text }}>Download Model</h2>
          <p style={{ marginBottom: '1rem', color: colors.text }}>
            The model "{modelToDownload}" is not installed. Do you want to download it now?
          </p>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressBarFill, width: `${downloadProgress}%` }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={handleDownloadModel}
              style={{
                ...styles.button,
                backgroundColor: colors.primary,
                color: colors.white,
                flex: 1,
                opacity: isDownloading ? 0.7 : 1,
              }}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button
              onClick={() => setShowDownloadModal(false)}
              style={{
                ...styles.button,
                backgroundColor: colors.lightGray,
                color: colors.text,
                flex: 1,
              }}
              disabled={isDownloading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            ¡Bienvenidos!
          </h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  backgroundColor: colors.primary,
                  color: colors.white,
                  flex: 1,
                }}
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                style={{
                  ...styles.button,
                  backgroundColor: colors.success,
                  color: colors.white,
                  flex: 1,
                }}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {!isLoggedIn ? (
        <div style={styles.loginPage}>
          <div style={styles.loginCard}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Welcome to AI Chat
            </h1>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    backgroundColor: colors.primary,
                    color: colors.white,
                    flex: 1,
                  }}
                >
                  Login
                </button>
                <button
                  onClick={handleRegister}
                  style={{
                    ...styles.button,
                    backgroundColor: colors.success,
                    color: colors.white,
                    flex: 1,
                  }}
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <header style={styles.header}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.text }}>
              AI Chat
            </h1>
            <button
              onClick={handleLogout}
              style={{
                ...styles.button,
                backgroundColor: colors.danger,
                color: colors.white,
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </header>
  
          <div style={styles.mainContent}>
            {renderSidebar()}
  
            {!currentModelId ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                backgroundColor: colors.background
              }}>
                <p style={{ color: colors.gray }}>
                  Please select or create an AI model to start chatting
                </p>
              </div>
            ) : (
              <div style={styles.chatArea}>
                <div style={styles.messagesContainer}>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={messageBubble(message.isAi)}>
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
  
                <div style={styles.inputArea}>
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                    }}
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      style={{
                        ...styles.input,
                        marginBottom: 0,
                        flex: 1,
                      }}
                      placeholder="Type your message..."
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      style={{
                        ...styles.button,
                        backgroundColor: colors.primary,
                        color: colors.white,
                        opacity: isLoading ? 0.7 : 1,
                      }}
                      disabled={isLoading}
                    >
                      <Send size={18} />
                      {isLoading ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
  
          {isAddModelModalOpen && renderAddModelModal()}
          {renderDownloadModal()}
        </>
      )}
    </div>
  );
};
export default AiChatApp;