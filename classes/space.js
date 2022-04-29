class Space {
    constructor(positionX, positionY, cost, timing, reserved) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.cost = cost;
        this.timing = timing;
        this.reserved = reserved;
    }
    get getCost() {
        return this.cost;
    }
    get getTiming() {
        return this.timing;
    }
    get getReserved() {
        return this.reserved;
    }
    set setCost(cost){
        this.cost = cost;
    }
    set setTiming(timing){
        this.timing = timing;
    }
    set setReserved(reserved){
        this.reserved = reserved;
    }
}

module.exports = Space;