const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
let gameSpeedElement = document.getElementById("gameSpeed");
let gameSpeed = 10;
let highScore = 0;
let averageScore = 0;
let epochNumber = 0;

let highScoreElement = document.getElementById("highScore");
let averageScoreElement = document.getElementById("averageScore");
let epochNumberElement = document.getElementById("epochNumber");

gameSpeedElement.addEventListener("change", () => {
    gameSpeed = parseInt(gameSpeedElement.textContent);
});

window.onload = () => {
    gameLoop()
}

function gameLoop() {
    setInterval(show, 1000/gameSpeed) // here gamespeed is our fps value
}

function show() {
    update()
    draw()
}

function update() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    snake.move()
    eatApple()
    checkCollision()
}

function eatApple() {
    if(snake.tail[snake.tail.length - 1].x == apple.x &&
        snake.tail[snake.tail.length - 1].y == apple.y){
            snake.tail[snake.tail.length] = {x:apple.x, y: apple.y}
            apple = new Apple();
        }
}

function gameOver() {
    highScore = Math.max(highScore, snake.tail.length - 1)
    highScoreElement.textContent = highScore;

    epochNumberElement.textContent = epochNumber++

    averageScoreElement.textContent = (parseInt(averageScoreElement.textContent) * epochNumber +snake.tail.length -1) / epochNumber;
    snake.initVars();
}

function checkCollision() {
    let headTail = snake.tail[snake.tail.length -1]
    if(headTail.x <= -snake.size || //wall hit
        headTail.x >= canvas.width ||
        headTail.y <= -snake.size ||
        headTail.y >= canvas.height) {
            gameOver()
            return
        }

    for (let i = 0; i < snake.tail.length - 2; i++) { //self bite
        if (headTail.x == snake.tail[i].x && headTail.y == snake.tail[i].y) {
            gameOver()
            return
        }
    }
}

function draw() {
    createRect(0,0,canvas.width, canvas.height, "black")
    createRect(0,0, canvas.width, canvas.height)

    for (let i = 0; i < snake.tail.length; i++){
        createRect(snake.tail[i].x + 2.5, snake.tail[i].y + 2.5,
            snake.size - 5, snake.size- 5, "white")
    }

    canvasContext.font = "20px Arial"
    canvasContext.fillStyle = "#00FF42"
    canvasContext.fillText("Score: " + (snake.tail.length -1),canvas.width - 120, 18)
    createRect(apple.x, apple.y, apple.size, apple.size, apple.color)
}

function createRect(x,y,width, height,color) {
    canvasContext.fillStyle = color
    canvasContext.fillRect(x, y, width, height)
}

window.addEventListener("keydown", (event) => {
    setTimeout(() => {
        if (event.keyCode == 37 && snake.rotateX != 1) {
            snake.rotateX = -1
            snake.rotateY = 0
        } else if (event.keyCode == 38 && snake.rotateY != 1) {
            snake.rotateX = 0
            snake.rotateY = -1
        } else if (event.keyCode == 39 && snake.rotateX != -1) {
            snake.rotateX = 1
            snake.rotateY = 0
        } else if (event.keyCode == 40 && snake.rotateY != -1) {
            snake.rotateX = 0
            snake.rotateY = 1
        }
    }, 1)
});

class RLSnake{
    constructor() {
        this.alpha = 0.2
        this.gamma = 0.2
        this.noEatLoopCount = 0
        this.maxNoEatLoopCount = 500
        this.isAheadClearIndex = 0
        this.isLeftClearIndex = 1
        this.isRightClearIndex = 2
        this.isAppleAheadIndex = 3
        this.isAppleLeftIndex = 4
        this.isAppleRightIndex = 5
        this.initialState = [1, 1, 1, 0, 0, 0]
        this.state = this.initialState
        this.Q_table = {}
    }

    calculateState() {
        
    }

    upadate() {

    }

    reward(state, action) {

    }

    implementAction(action) {

    }

    getQ(state, action) {

    }

    getAction(state) {

    }

    checkDirection() {
        let correspondingSize;
        let headTail = snake.tail[snake.tail.length - 1]
        let rx = snake.rotateX
        let ry = snake.rotateY

        //wall added
        if(
            (ry == 1 && headTail.x == 0) ||
            (rx == 1 && headTail.y + size == canvas.height) ||
            (ry == -1 && headTail.x + size == canvas.width) ||
            (rx == -1 && headTail.x == 0)
        ) {
            this.state[this.isRightClearIndex] = 0
        }


        if(
            (ry == 1 && headTail.y + size == canvas.height) ||
            (rx == 1 && headTail.x + size == canvas.width) ||
            (ry == -1 && headTail.x == 0) ||
            (rx == -1 && headTail.x == 0)
        ) {
            this.state[this.isAheadClearIndex] = 0
        }
        
        if(
            (ry == 1 && headTail.x + size == canvas.width) ||
            (rx == 1 && headTail.y == 0) ||
            (ry == -1 && headTail.x == 0) ||
            (rx == -1 && headTail.x + size == canvas.height)
        ) {
            this.state[this.isLeftClearIndex] = 0
        }

        for( let i = 0; i < snake.tail.length - 2; i++) {
            let ithTail = snake.tail[i];
            if(rx == 0 && headTail.y == ithTail.y) {
                correspondingSize = ry == 1 ? -size: size
                if(headTail.x = ithTail.x + correspondingSize) {
                    this.state[this.isLeftClearIndex] = 0
                }
                if(headTail.x == ithTail.x - correspondingSize) {
                    this.state[this.isRightClearIndex] = 0
                }
            } else if(ry == 0 && headTail.x == ithTail.x) {
                correspondingSize = rx == 1 ? -size: size
                if(headTail.y = ithTail.y + correspondingSize) {
                    this.state[this.isRightClearIndex] = 0
                }
                if(headTail.y == ithTail.y - correspondingSize) {
                    this.state[this.isLeftClearIndex] = 0
                }
            }
            if (
                rx = 0 &&
                headTail.x == ithTail.x &&
                headTail.y + ry * size == ithTail.y
            ) {
                this.state[this.isAheadClearIndex] = 0
            }
            if (
                ry = 0 &&
                headTail.y == ithTail.y && 
                headTail.y + ry * size == ithTail.y
            ) {
                this.state[this.isAheadClearIndex] = 0
            }
        }
    }
}

class Snake {
    constructor() {
        this.initVars();
    }

    initVars() {
        this.x = 20;
        this.y = 20;
        this.size = 20;
        this.tail = [{x:this.x, y:this.y}]
        this.rotateX = 0
        this.rotateY = 1
    }

    move() {
        let newRect

        if (this.rotateX == 1) {
            newRect = {
                x: this.tail[this.tail.length - 1].x + this.size,
                y: this.tail[this.tail.length - 1].y
            }
        } else if (this.rotateX == -1) {
            newRect = {
                x: this.tail[this.tail.length - 1].x - this.size,
                y: this.tail[this.tail.length - 1].y
            }
        } else if (this.rotateY == 1) {
            newRect = {
                x: this.tail[this.tail.length - 1].x,
                y: this.tail[this.tail.length - 1].y + this.size
            }
        } else if (this.rotateY == -1) {
            newRect = {
                x: this.tail[this.tail.length - 1].x,
                y: this.tail[this.tail.length - 1].y - this.size
            }
        }

        this.tail.shift()
        this.tail.push(newRect)
    }
}

class Apple{
    constructor(){
        let isTouching
        
        while (true) {
            isTouching = false;
            this.x = Math.floor(Math.random() * canvas.width / snake.size) * snake.size
            this.y = Math.floor(Math.random() * canvas.height / snake.size) * snake.size
            
            for (let i = 0; i < snake.tail.length; i++) {
                if (this.x == snake.tail[i].x && this.y == snake.tail[i].y) {
                    isTouching = true
                }
            }

            this.size = snake.size
            this.color = "red"

            if (!isTouching) {
                break;
            }
        }
    }
}

const snake = new Snake();
let apple = new Apple();