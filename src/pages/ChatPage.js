import React, { useEffect, useRef, useState } from 'react';
import './ChatPage.css';

const initialThreads = [
  {
    id: 'general',
    name: 'General',
    description: 'Chat about anything',
    messages: [
      { id: 'm1', author: 'u/alice', text: 'Welcome to the chat! Feel free to drop a message.', timestamp: '2m ago' },
      { id: 'm2', author: 'u/bob', text: 'Hey everyone 👋', timestamp: '1m ago' }
    ]
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Ask quick questions',
    messages: [
      { id: 'm3', author: 'u/mod', text: 'Need help? Ask here and someone will reply.', timestamp: '5m ago' }
    ]
  }
];

function ChatPage() {
  const [threads, setThreads] = useState(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState(initialThreads[0].id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const messageEndRef = useRef(null);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setSending(true);
    setThreads(prev => prev.map(thread => {
      if (thread.id !== activeThreadId) return thread;
      const newMessage = {
        id: `${Date.now()}`,
        author: 'u/you',
        text: text.trim(),
        timestamp: 'just now'
      };
      return { ...thread, messages: [...thread.messages, newMessage] };
    }));

    // Mock bot reply
    setTimeout(() => {
      setThreads(prev => prev.map(thread => {
        if (thread.id !== activeThreadId) return thread;
        const reply = {
          id: `${Date.now()}-bot`,
          author: 'u/helper-bot',
          text: 'Thanks for your message! Someone will respond shortly.',
          timestamp: 'just now'
        };
        return { ...thread, messages: [...thread.messages, reply] };
      }));
      setSending(false);
    }, 700);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sending || !draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="sidebar-header">Chats</div>
        <div className="thread-list">
          {threads.map(thread => (
            <button
              key={thread.id}
              className={`thread-item ${thread.id === activeThreadId ? 'active' : ''}`}
              onClick={() => setActiveThreadId(thread.id)}
            >
              <div className="thread-name">{thread.name}</div>
              <div className="thread-desc">{thread.description}</div>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-main">
        <div className="chat-header">
          <div>
            <div className="chat-title">{activeThread?.name}</div>
            <div className="chat-subtitle">{activeThread?.description}</div>
          </div>
        </div>

        <div className="chat-messages">
          {activeThread?.messages.map(msg => (
            <div key={msg.id} className={`message ${msg.author === 'u/you' ? 'outgoing' : 'incoming'}`}>
              <div className="message-meta">
                <span className="author">{msg.author}</span>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
              <div className="message-body">{msg.text}</div>
            </div>
          ))}
          <div ref={messageEndRef}></div>
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !draft.trim()}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ChatPage;
