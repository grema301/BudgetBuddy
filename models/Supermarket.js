class Supermarket {
    constructor(name, address) {
        this.name = name;
        this.address = address;
        this.products = []; 
    }

    addProduct(product) {
        this.products.push(product);
    }

    getProductsByCategory(categoryName) {
        return this.products.filter(product => product.categoryName === categoryName);
    }
}

module.exports = Supermarket;