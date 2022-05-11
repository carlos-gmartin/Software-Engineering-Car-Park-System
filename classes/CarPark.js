const space = require('./space.js');

class CarPark {
    
    constructor(name, rows, columns, pricePerHour){
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        this.longitude = 0.0;
        this.latitude = 0.0;
        this.spaceArray = [];
            // X value
        for (let indexX = 0; indexX < rows; indexX++) {
            // Y value
            for (let indexY = 0; indexY < columns; indexY++) {
                var newSpace = new space(indexX, indexY, pricePerHour, 0, "false");
                this.spaceArray.push(newSpace);
            }
        }
    }

    getSpace(row, column) {
        return spaceArray[this.row][column];
    }

    getLongitude(){
        return this.longitude;
    }

    getLatitude(){
        return this.latitude;
    }
}

module.exports = CarPark;