import space, * as space from './space.js'

class carPark {
    constructor(name, rows, columns){
        this.spaceArray = [[]];
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        this.longitude = 0.0;
        this.latitude = 0.0;
    }

    getSpace(row, column) {
        var space = new space(5, 5, 5, 5, "true");
        console.log(space);
        return spaceArray[this.row][column];
    }

    getLongitude(){
        return this.longitude;
    }

    getLatitude(){
        return this.latitude;
    }
}