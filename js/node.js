class Node {
    constructor(x, y, scl) {
        this.x = x;
        this.y = y;
        this.scl = scl;
        this.wall = false;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.previous = undefined;
    }
    get coord() {
        return [this.x * this.scl, this.y * this.scl];
    }
}