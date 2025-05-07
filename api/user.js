const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getHashedPassword } = require("../database/UserDAO");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
    console.log("Registering user:", req.body);
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);
    
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await registerUser(firstName, lastName, email, hashedPassword);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Logging in user:", req.body);
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const storedHashedPassword = await getHashedPassword(email);
        if (!storedHashedPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, storedHashedPassword);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const user = await loginUser(email);
        if (user.error) {
            return res.status(401).json({ error: user.error });
        }

        // Generate JWT token
        // const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: "1h" });
        // res.json({ token });
        res.status(200).json({ message: "Login successful"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
module.exports = router;
