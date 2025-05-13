require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./api/product');
const userRoutes = require('./api/user');
const path = require('path');
const bcrypt = require('bcrypt');
const http = require('http');
const saltRounds = 10;


const app = express();
app.use(cors());
app.use(express.json());

// Serve all static files from the 'web' directory
app.use(express.static(path.join(__dirname, 'web')));

//Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html')); 
});
app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));  
});

// Route: Product page
app.get("/product/:name", (req, res) => {
    res.sendFile(path.join(__dirname, "web", "product.html"));
});

// Route: Register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'register.html'));
});

// Route: Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);


app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'cart.html'));
});

const { spawn } = require('child_process');

// Store AI chat context in-memory
let chatHistory = [];

// Route for initial recipe suggestions
app.post('/ai/suggest', async (req, res) => {
  console.log('Received cart:', req.body.cart);
  const cartItems = req.body.cart.map(item => `${item.quantity} x ${item.name}`).join(', ');
  const prompt = `I have these groceries in my cart: ${cartItems}. What recipes can I make with them?`;

  try {
    const response = await callGroq([
      { role: 'system', content: 'You are a helpful cooking assistant.' },
      { role: 'user', content: prompt }
    ]);
    chatHistory = [{ role: 'user', content: prompt }, { role: 'assistant', content: response }];
    res.json({ response });
  } catch (err) {
    console.error('AI suggest error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Route for ongoing chat
app.post('/ai/chat', async (req, res) => {
  const userMessage = req.body.message;
  chatHistory.push({ role: 'user', content: userMessage });

  try {
    const response = await callGroq(chatHistory);
    chatHistory.push({ role: 'assistant', content: response });
    res.json({ response });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Function to call Groq's hosted LLM
async function callGroq(messages) {
  const groqKey = process.env.GROQ_API_KEY;
  const model = 'meta-llama/llama-4-scout-17b-16e-instruct'; // Or mixtral, gemma, etc.

  console.log('Sending request to Groq:', {
    model,
    messages,
    temperature: 0.7
  });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}



app.get("*", (req, res) => {
    res.status(404).send("404 Not Found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));