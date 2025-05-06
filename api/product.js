const express = require("express");
const router = express.Router();
const { getAllProducts, getProductByName } = require("../database/ProductDAO");


router.get("/", async (req, res) => {
    const data = await getAllProducts();
    res.json(data);
});

router.get("/:name", async (req, res) => {
    const data = await getProductByName(req.params.name);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
});

module.exports = router;