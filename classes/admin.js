const space = require('./space.js');
const user = require('./user.js');
const CarPark = require('./CarPark.js');


class Admin {

  constructor (username, password, telephoneNumber){
      this.username = username;
      this.password = password;
      this.telephoneNumber = telephoneNumber;
  }

  resetSystem()
  {
    
  }

  setMoney(user, double)
  {
      user.addMoney(double);
  }

  addCarPark(name, rows, columns, cost)
  {
    var carPark = new CarPark(name, rows, columns, cost);
    return carPark;
  }

  unbookSpace(space, user)
  {
    user.currentLocation = null;
    space.timing = 0;
    space.reserved = "false";
  }

}

module.exports = Admin;
