class space {
    constructor(row, column, cost, timing, reserved){
        this.row = row;
        this.column = column;
        this.occupied = false;
        this.invisible = false;
        this.occupant = null;
        this.event = null;
    }

    occupy(user){
        this.occupied = true;
        this.occupant = user;
    }

    setEvent(event){
        this.event = event;
    }

}

module.exports = space;