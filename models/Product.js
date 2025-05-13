class Product {
    constructor(id, name, price, imageUrl, categoryName, supermarketName) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.categoryName = categoryName;
        this.supermarketName = supermarketName;
    }

    
    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
}

module.exports = Product;