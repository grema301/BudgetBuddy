const {openrouter} = require('@openrouter/ai-sdk-provider');
const { generateText } = require('ai');
require('dotenv').config()

async function aiCat(name) {
  try{
    console.log("Sending request to OpenRouter API...");
    const result = await generateText({
      model: openrouter('qwen/qwen3-1.7b:free'),
      messages: [
        {
          role: 'user',
          content: `You are a grocery categorization engine. 
    Classify the following product into the most relevant category from this list:
    
    - Produce
    - Dairy
    - Meat & Seafood
    - Pantry
    - Bakery
    - Beverages
    - Frozen
    - Household
    - Personal Care
    - Snacks
    - Other
    
    Product: ${name}
  
    Respond with the exact category only.`
        }
      ]
    });
    
    console.log(result.text);
    if(result.text.length > 0){
      //console.log("Response received from OpenRouter API:", result.text);
      const arr = ["Produce", "Dairy", "Meat & Seafood", "Pantry", "Bakery", "Beverages", "Frozen", "Household", "Personal Care", "Snacks", "Other"];
      const foundCategory = arr.find(category => result.text.includes(category));
      if(foundCategory){
        console.log("Category found:", foundCategory);
        return foundCategory;
      }else{
        return null; // No category found in the response
      }
      
    }else{
      console.error("No response received from OpenRouter API.");
      return null;
    }
  }catch (error) {
    console.error('Error generating text:', error);
    return null;
  }
}
module.exports = aiCat;