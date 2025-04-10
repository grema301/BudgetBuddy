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
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=budgetbuddy
    DB_PORT=3306 "(default port for mysql)"
    ```
 - start the application locally 
   ```bash
   npm run start
   ```
#### Note
 - Currently in this iteration we cannot populate the database with the required information. We will need some data processing there so we the attributes for out various entities can be filled. 


### Current application process
1.  Data mining and processing
    - Use a web scrapper to get our data.
    - Process the initial data such that we can fill our attributes in our database tables.(<strong>Products and stores for now.</strong>)
    - Ensure consistency and avoid redundancies.
2. Data retreival and serving it to our clients.
   -  Use the database as the primary way to retreive data, and serve it to our clients and through web application.

  
