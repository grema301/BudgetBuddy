require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const http = require('http');
const saltRounds = 10;



const populateDatabase = require(path.join(__dirname, 'database', 'populate_db.js'));

populateDatabase()
    .then(() => console.log("Database populated successfully!"))
    .catch(err => console.error("Error populating database:", err));

const app = express();
app.use(cors());
app.use(express.json());

//Rooutes using registration as default for people
// Explicit routes for HTML files
app.get('/', (req, res) => {
    res.redirect('/register');
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};


app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            `INSERT INTO User 
            (first_name, last_name, email_address, password) 
            VALUES (?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword]
        );
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            error: error.code === 'ER_DUP_ENTRY' 
                ? 'Email already in use' 
                : 'Registration failed'
            });
        }
    });

    
    app.post('/login', async (req, res) => {
      try {
            const connection = await mysql.createConnection(dbConfig);
            const [users] = await connection.execute(
                'SELECT * FROM User WHERE email_address = ?',
                [req.body.email]
            );
            
            if (users.length === 0 || !await bcrypt.compare(req.body.password, users[0].password)) {
                return res.status(401).send('Invalid credentials');
            }
            
            res.json({
                userId: users[0].user_id,
                name: `${users[0].first_name} ${users[0].last_name}`,
                email: users[0].email_address
            });
        } catch (error) {
            res.status(500).send('Login error');
        }
    });


// Fetch all products
app.get('/products', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    const [products] = await connection.execute("select * from Product inner join Price on Product.product_id = Price.product_id");
    await connection.end();
    console.log("Products fetched:", products.length);
    res.json(products);
});

// Fetch product details with prices
app.get('*/products/:name', async (req, res) => {
    const { name } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute("select * from Product inner join Price on Product.product_id = Price.product_id where product_name = ?", [name]);
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    await connection.end();
    console.log("Product details fetched:", rows.length);

    //Restructure product data to match the expected format
    const productData = {
        name: rows[0].product_name,
        image_url: rows[0].image_url,
        prices: {}
    };

    rows.forEach(row => {
        productData.prices[row.supermarket_name] = {
            price: row.price,
            // add link here if you want it
        };
    });
    res.json({productData});
});

app.post('/cart/prices', express.json(), async (req, res) => {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
        return res.json({});
    }

    const connection = await mysql.createConnection(dbConfig);
    const totals = {};

    for (const item of items) {
        const [productRows] = await connection.execute(
            "SELECT product_id FROM Product WHERE product_name = ?",
            [item.name]
        );

        if (productRows.length === 0) continue;

        const productId = productRows[0].product_id;
        const quantity = Number(item.quantity) || 1;

        const [priceRows] = await connection.execute(`
            SELECT Price.supermarket_name, Price.price 
            FROM Price 
            WHERE Price.product_id = ?
        `, [productId]);

        priceRows.forEach(row => {
            if (!totals[row.supermarket_name]) {
                totals[row.supermarket_name] = 0;
            }
            totals[row.supermarket_name] += row.price * quantity;
        });
    }

    await connection.end();
    console.log("Cart totals returned:", totals);
    res.json(totals);
});

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
    const response = await callOllama(prompt);
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
    const fullPrompt = chatHistory.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n') + '\nAI:';
    const response = await callOllama(fullPrompt);
    chatHistory.push({ role: 'assistant', content: response });
    res.json({ response });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Function to call local Ollama model via subprocess
function callOllama(prompt) {
  return new Promise((resolve, reject) => {
    const ollama = spawn('ollama', ['run', 'llama2'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let output = '';
    ollama.stdout.on('data', (data) => {
      output += data.toString();
    });

    ollama.on('error', reject);

    ollama.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Ollama exited with code ${code}`));
      resolve(output.trim());
    });

    ollama.stdin.write(prompt);
    ollama.stdin.end();
  });
}




app.use(express.static(path.join(__dirname, 'web')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
