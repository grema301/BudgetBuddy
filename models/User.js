class User {
    constructor(userId, firstName, lastName, password, email, address = null) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.email = email;
        this.address = address;   
    }

    //get the persons full name, not just first
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    // makes sure its a valid email basically
    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }
}

module.exports = User;