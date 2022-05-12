const space = require('./space.js');

class User {
    constructor(username, password, balance, telephoneNumber) {
        this.username = username;
        this.password = password;
        this.balance = balance;
        /*current space*/
        this.currentLocation;
        this.telephoneNumber = telephoneNumber;
    }

    bookSpace(space, timing){
        space.timing = timing;
        space.reserved = "true";
        this.currentLocation = space;
        return space;
    }

    addMoney(amount) {
        balance += amount;
    }

    removeMoney(amount) {
        balance +- amount;
    }
}

module.exports = User;
/*Collapse
user_class.js
1 KB

Message #general
*/
