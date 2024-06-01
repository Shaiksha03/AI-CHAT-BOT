import React from 'react';

function Header() {
  return (
    <header>
      <h1>Monica Mimic Chatbot</h1>
      <select id="agentSelector">
        <option value="default">Select Agent</option>
        <option value="linkedin">LinkedIn Post Generator</option>
        <option value="projectIdea">Project Idea Generator</option>
      </select>
    </header>
  );
}

export default Header;
