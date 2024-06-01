import React, { useState } from 'react';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const sendMessage = async () => {
    const message = userInput.trim();
    const agent = document.getElementById('agentSelector').value;

    if (message === "") {
      alert("Please enter a message.");
      return;
    }

    if (agent === "default") {
      alert("Please select an agent.");
      return;
    }

    setMessages([...messages, { type: 'user', text: message }]);
    setUserInput('');

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, agent }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (data.reply) {
        setMessages([...messages, { type: 'user', text: message }, { type: 'bot', text: data.reply }]);
      } else {
        setMessages([...messages, { type: 'user', text: message }, { type: 'error', text: `Error: ${data.error}` }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Full error response:", error.message);
    }
  };

  return (
    <div className="chatArea">
      <div id="chatWindow">
        <div id="chatHistory">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}-message`}>
              <p>{msg.type === 'user' ? `You: ${msg.text}` : msg.type === 'bot' ? `Bot: ${msg.text}` : msg.text}</p>
            </div>
          ))}
        </div>
        <div className="inputArea">
          <input 
            type="text" 
            id="userInput" 
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button id="sendButton" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
