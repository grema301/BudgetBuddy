# BudgetBuddy


### To start the project
 - Clone the repo and install the node modules.
    ```bash
    git clone https://github.com/grema301/BudgetBuddy.git
    cd BudgetBuddy 
    npm install
    ```
 -  Create the .env file save the following to the .env file.
    ```bash
    DATABASE_URL=postgresql://postgres.uwsuqcgdmelazpfyppsn:I98nb0x6h5L3@aws-0-us-east-2.pooler.supabase.com:6543/postgres
   DB_HOST_SUPABASS=aws-0-us-east-2.pooler.supabase.com
   DB_USER_SUPABASS=postgres
   DB_PASSWORD_SUPABASS=I98nb0x6h5L3
   DB_NAME_SUPABASS=postgres
   DB_PORT_SUPABASS=6543
   OPENROUTER_API_KEY=AIzaSyCh4iHsSYOApJR-uim5colcul0wFMFhiSY
    ```
 - To run the application 
1.  
   ```bash
   npm install
   ```
2.  
   ```bash
   npm run start
   ```
#### Note
 - Database alreay setup on supabase


### Current application process
1.  Data mining and processing
    - Use a web scrapper to get our data.
    - Process the initial data such that we can fill our attributes in our database tables.(<strong>Products and stores for now.</strong>)
    - Ensure consistency and avoid redundancies.
2. Data retreival and serving it to our clients.
   -  Use the database as the primary way to retreive data, and serve it to our clients and through web application.
3. Use AI as our categorization engine based on product name.

  
