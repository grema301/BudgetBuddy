const sql  = require('./dbConnection');
// This module provides functions to interact with the User table in the database.

async function registerUser(firstName, lastName, email, password) {
    // Use parameterized query to prevent SQL injection
    // and to ensure that the email is unique
    const existingUser = await sql`SELECT * FROM public."User" WHERE email_address = ${email}`;
    if (existingUser.length > 0) {
        return { error: `Email ${email} already exists` };  
    }
    const result  = await sql`
        INSERT INTO public."User"(first_name, last_name, email_address, password)
        VALUES (${firstName}, ${lastName}, ${email}, ${password})
        ON CONFLICT (email_address) DO NOTHING
        RETURNING user_id
    `;
    return result;
}

async function loginUser(email, password) {
    // Use parameterized query to prevent SQL injection
    const result  = await sql`SELECT * FROM public."User" WHERE email_address = ${email}`;
    if (result.length > 0) {
        return result[0]; // Return the user object if found
    } else {
        return {error: 'Email not found or password invalid'};
    }
}
async function getHashedPassword(email) {
    // Use parameterized query to prevent SQL injection
    const result  = await sql`SELECT password FROM public."User" WHERE email_address = ${email}`;
    if (result.length > 0) {
        return result[0].password; // Return the hashed password if found
    } else {
        return null; // Return null if no user found with the given email
    }
}
module.exports = { registerUser, loginUser , getHashedPassword};
