import React, { useState } from 'react';

function ChatHistory() {
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [chats, setChats] = useState([]);

  const toggleChatHistory = async () => {
    if (isHistoryLoaded) {
      setChats([]);
      setIsHistoryLoaded(false);
    } else {
      await loadChatHistory();
      setIsHistoryLoaded(true);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const chats = await response.json();
      const deletedChats = JSON.parse(localStorage.getItem('deletedChats')) || [];
      setChats(chats.filter(chat => !deletedChats.includes(chat.id)));
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const deleteChatUI = (id) => {
    const updatedChats = chats.filter(chat => chat.id !== id);
    setChats(updatedChats);
    let deletedChats = JSON.parse(localStorage.getItem('deletedChats')) || [];
    if (!deletedChats.includes(id)) {
      deletedChats.push(id);
      localStorage.setItem('deletedChats', JSON.stringify(deletedChats));
    }
  };

  return (
    <aside className="sidebar">
      <h2>Chat History</h2>
      <button id="loadHistoryButton" onClick={toggleChatHistory}>
        {isHistoryLoaded ? 'Hide Chat History' : 'Load Chat History'}
      </button>
      <ul id="chatHistoryList">
        {chats.map(chat => (
          <li key={chat.id} data-id={chat.id}>
            <strong>Agent:</strong> {chat.agent} <br />
            <strong>Message:</strong> {chat.message} <br />
            <strong>Reply:</strong> {chat.reply} <br />
            <button onClick={() => deleteChatUI(chat.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default ChatHistory;
