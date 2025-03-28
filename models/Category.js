class Category {
    constructor(name) {
        this.name = name;
        this.products = []; 
    }

    // same as supermarket
    addProduct(product) {
        this.products.push(product);
    }
    
    getAveragePrice() {
        if (this.products.length === 0) return 0;
        const total = this.products.reduce((sum, product) => sum + product.price, 0);
        return total / this.products.length;
    }
}

module.exports = Category;