class User {
    constructor(username, password, balance, telephoneNumber) {
        this.username = username;
        this.password = password;
        this.balance = balance;
        /*current space*/
        this.currentLocation = [0,0];
        this.telephoneNumber = telephoneNumber;
    }

    /*
    bookSpace(){

    }
    */

    addMoney(amount) {
        balance += amount;
    }

    removeMoney(amount) {
        balance +- amount;
    }

}
Collapse
user_class.js
1 KB

Message #general
