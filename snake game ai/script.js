
class Snake {
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        this.tail = [{x:this.x, y:this.y}]
        this.rotateX = 0
        this.rotateY = 1
    }

    move(){
        var newRect;
        if(this.rotateX == 1){
            newRect = {
                x : this.tail[this.tail.length - 1].x + this.size
            }
        }
    }
}


var canvas = document.getElementById("canvas")

var snake = new Snake();

var apple = new Apple();

var canvasContext = canvas.getContxt('2d');

window.onload = () => {
    gameLoop();
}

function gameLoop () {
    setInterval(show, 1000/15)
}

function show () {
    update();
    draw();
}