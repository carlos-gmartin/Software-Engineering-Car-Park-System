class CarPark {
    constructor(name, rows, columns){
        this.spaceArray = [[]];
        this.name = name;
        this.rows = rows;
        this.columns = columns;
        this.longitude = 0.0;
        this.latitude = 0.0;
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

