# BudgetBuddy

BudgetBuddy is a grocery price comparison app, it uses webscrappers to take grocery data from different supermarket websties and store them in our database. 

From this, the items are then matched together and compared by price.

## Current Features

- **Browse Products** – Scroll through a selection of grocery items.
- **Compare Products** – See the prices of these products across the largest supermarkets in New Zealand
- **Search** – Quickly search for items using keywords like “bananas.”
- **AI Category filtering** - Items can be filter by category such as *dairy*, *produce*, etc.
- **Add to Cart** – Click a button to add items to your cart and see totals.
-  **AI Assistant** – Suggest recipes from items in cart and ask other shopping-related questions like “What are healthy snacks for kids?”
- **Clean Routing** – User-friendly URLs for products, cart, and search.

---

## To use the project

👉 **Access it instantly here:**  
**https://budgetbuddy-fsyr.onrender.com**

Everything is externally hosted including the database, LLM, and therefore there is no need for installs on your own machine.

No downloads or commands are required.
    
## Example Use Cases

Let’s say you want to buy bananas:

1. Open the site: [https://budgetbuddy-fsyr.onrender.com](https://budgetbuddy-fsyr.onrender.com)
2. Use the search bar to type: **bananas**
3. Press the **“Add to Cart”** button on your preferred result
4. Navigate to the **Cart** and confirm the item is there
5. Try the AI chatbot by asking something like: 
   > “What pairs well with bananas for a light snack”

Let’s say you want to make a larger shop and find recipes:

1. Open the site: [https://budgetbuddy-fsyr.onrender.com](https://budgetbuddy-fsyr.onrender.com)
2. Scroll through the home page and add a varitety of items that you want in your cart.
3. Navigate to the **Cart** and confirm now the prices of all thse items across the different supermarkets will all be displayed
4. Try the AI **suggest recipes** features with what is in your cart


---

## Current Features
   - Functioning webscappers to 
   - External database holding data from webscrappers
   - Search bar and category filtering
   - Cart 
   - AI LLM chatbot to suggest recipes and other items to add



## Known present bugs
   - There are some issues with the search functionality
   - Registration/Login functionality and communication with database
   - AI model sanitation, currently it can go off topic and have hallucinations
   - Some items are not matched to each other correctly within the database



## 🧰 Local Setup (Optional)

Only follow these steps if you want to run the app locally for development purposes.

### Requirements
- Node.js and npm
- MySQL Server
- .env file with api keys for groq (ai model) and database (host, user, password, port etc)

### Installation Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/grocery-store.git
   cd BudgetBuddy

2. **Dependancies**
npm install
   
3. **Start server**
npm run start

## Planned Improvements
- Better integration of login and registration system.
- Profile options for favourite items etc
- Continous integration for webscrappers for up-to-date pricing




