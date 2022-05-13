class Space {
    constructor(positionX, positionY, cost, reserved, selected) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.cost = cost;
        this.timing = 0;
        this.reserved = reserved;
        this.selected = selected;
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
    set setSelected(selected){
        this.selected = selected;
    }
}

module.exports = Space;