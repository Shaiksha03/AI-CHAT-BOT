import React from 'react';
import './App.css';
import Header from './components/Header';
import ChatHistory from './components/ChatHistory';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="container">
      <Header />
      <div className="main">
        <ChatHistory />
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;
