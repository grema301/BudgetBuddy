# BudgetBuddy


### To start the project
 - Clone the repo and install the node modules.
    ```bash
    git clone https://github.com/grema301/BudgetBuddy.git
    cd BudgetBuddy 
    npm install
    ```

 - To run the application on own machine
1.  
   ```bash
   npm install
   ```
2.  
   ```bash
   npm run start
   ```
#### Note
 - Database already setup on supabase
 - you will need to create a .env file with the following
DATABASE_URL=
DB_HOST_SUPABASS=
DB_USER_SUPABASS=
DB_PASSWORD_SUPABASS=
DB_NAME_SUPABASS=
DB_PORT_SUPABASS=
GROQ_API_KEY=
   - *enquire with us if you want to run on you machine first because you will need our db hosting key*

3. go to localhost:(portnumber) in web browser





### Current application process
1.  Data mining and processing
    - Use a web scrapper to get our data.
    - Process the initial data such that we can fill our attributes in our database tables.(<strong>Products and stores for now.</strong>)
    - Ensure consistency and avoid redundancies.
2. Data retreival and serving it to our clients.
   -  Use the database as the primary way to retreive data, and serve it to our clients and through web application.
3. Use AI as our categorization engine based on product name.

  
