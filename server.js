const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const admin = require('firebase-admin');
const path = require('path'); // Added path module
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 0,
  maxOutputTokens: 2048,
  responseMimeType: 'text/plain',
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://console.firebase.google.com/project/ai-chat-bot-03/firestore/data/~2F?view=panel-view&query=1%7CLIM%7C3%2F100&scopeType=collection&scopeName=%2Fchats" // Replace with your Firebase database URL
});

const db = admin.firestore();
const chatsCollection = db.collection('chats');

app.post('/api/message', async (req, res) => {
  const { message, agent } = req.body;
  try {
    const chatSession = model.startChat({ generationConfig, safetySettings, history: [] });
    const result = await chatSession.sendMessage(message);
    const reply = result.response.text();

    const chat = { message, reply, agent, timestamp: new Date() };
    await chatsCollection.add(chat);

    res.json({ reply });
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error sending message' });
  }
});

app.get('/api/chats', async (req, res) => {
  try {
    const snapshot = await chatsCollection.get();
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error.message);
    res.status(500).json({ error: 'Error fetching chats' });
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await chatsCollection.doc(id).delete();
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error.message);
    res.status(500).json({ error: 'Error deleting chat' });
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
