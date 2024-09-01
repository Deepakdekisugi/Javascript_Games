Math.minmax = (value, limit) => {
    return Math.max(Math.min(value, limit), -limit);
  };
  
  const distance2D = (p1, p2) => {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  };
  
  // Angle between the two points
  const getAngle = (p1, p2) => {
    let angle = Math.atan((p2.y - p1.y) / (p2.x - p1.x));
    if (p2.x - p1.x < 0) angle += Math.PI;
    return angle;
  };
  
  // The closest a ball and a wall cap can be
  const closestItCanBe = (cap, ball) => {
    let angle = getAngle(cap, ball);
  
    const deltaX = Math.cos(angle) * (wallW / 2 + ballSize / 2);
    const deltaY = Math.sin(angle) * (wallW / 2 + ballSize / 2);
  
    return { x: cap.x + deltaX, y: cap.y + deltaY };
  };
  
  // Roll the ball around the wall cap
  const rollAroundCap = (cap, ball) => {
    // The direction the ball can't move any further because the wall holds it back
    let impactAngle = getAngle(ball, cap);
  
    // The direction the ball wants to move based on it's velocity
    let heading = getAngle(
      { x: 0, y: 0 },
      { x: ball.velocityX, y: ball.velocityY }
    );
  
    // The angle between the impact direction and the ball's desired direction
    // The smaller this angle is, the bigger the impact
    // The closer it is to 90 degrees the smoother it gets (at 90 there would be no collision)
    let impactHeadingAngle = impactAngle - heading;
  
    // Velocity distance if not hit would have occurred
    const velocityMagnitude = distance2D(
      { x: 0, y: 0 },
      { x: ball.velocityX, y: ball.velocityY }
    );
    // Velocity component diagonal to the impact
    const velocityMagnitudeDiagonalToTheImpact =
      Math.sin(impactHeadingAngle) * velocityMagnitude;
  
    // How far should the ball be from the wall cap
    const closestDistance = wallW / 2 + ballSize / 2;
  
    const rotationAngle = Math.atan(
      velocityMagnitudeDiagonalToTheImpact / closestDistance
    );
  
    const deltaFromCap = {
      x: Math.cos(impactAngle + Math.PI - rotationAngle) * closestDistance,
      y: Math.sin(impactAngle + Math.PI - rotationAngle) * closestDistance,
    };
  
    const x = ball.x;
    const y = ball.y;
    const velocityX = ball.x - (cap.x + deltaFromCap.x);
    const velocityY = ball.y - (cap.y + deltaFromCap.y);
    const nextX = x + velocityX;
    const nextY = y + velocityY;
  
    return { x, y, velocityX, velocityY, nextX, nextY };
  };
  
  // Decreases the absolute value of a number but keeps it's sign, doesn't go below abs 0
  const slow = (number, difference) => {
    if (Math.abs(number) <= difference) return 0;
    if (number > difference) return number - difference;
    return number + difference;
  };
  
  const mazeElement = document.getElementById("maze");
  const joystickHeadElement = document.getElementById("joystick-head");
  const noteElement = document.getElementById("note"); // Note element for instructions and game won, game failed texts

  let hardMode = false;
let previousTimestamp;
let gameInProgress;
let mouseStartX;
let mouseStartY;
let accelerationX;
let accelerationY;
let frictionX;
let frictionY;

const pathW = 25; // Path width
const wallW = 10; // Wall width
const ballSize = 10; // Width and height of the ball
const holeSize = 18;

const debugMode = false;

let balls = [];
let ballElements = [];
let holeElements = [];

resetGame();

// Draw balls for the first time
balls.forEach(({ x, y }) => {
  const ball = document.createElement("div");
  ball.setAttribute("class", "ball");
  ball.style.cssText = `left: ${x}px; top: ${y}px; `;

  mazeElement.appendChild(ball);
  ballElements.push(ball);
});

// Wall metadata
const walls = [
  // Border
  { column: 0, row: 0, horizontal: true, length: 10 },
  { column: 0, row: 0, horizontal: false, length: 9 },
  { column: 0, row: 9, horizontal: true, length: 10 },
  { column: 10, row: 0, horizontal: false, length: 9 },

  // Horizontal lines starting in 1st column
  { column: 0, row: 6, horizontal: true, length: 1 },
  { column: 0, row: 8, horizontal: true, length: 1 },

  // Horizontal lines starting in 2nd column
  { column: 1, row: 1, horizontal: true, length: 2 },
  { column: 1, row: 7, horizontal: true, length: 1 },

  // Horizontal lines starting in 3rd column
  { column: 2, row: 2, horizontal: true, length: 2 },
  { column: 2, row: 4, horizontal: true, length: 1 },
  { column: 2, row: 5, horizontal: true, length: 1 },
  { column: 2, row: 6, horizontal: true, length: 1 },

  // Horizontal lines starting in 4th column
  { column: 3, row: 3, horizontal: true, length: 1 },
  { column: 3, row: 8, horizontal: true, length: 3 },

  // Horizontal lines starting in 5th column
  { column: 4, row: 6, horizontal: true, length: 1 },

  // Horizontal lines starting in 6th column
  { column: 5, row: 2, horizontal: true, length: 2 },
  { column: 5, row: 7, horizontal: true, length: 1 },

  // Horizontal lines starting in 7th column
  { column: 6, row: 1, horizontal: true, length: 1 },
  { column: 6, row: 6, horizontal: true, length: 2 },

  // Horizontal lines starting in 8th column
  { column: 7, row: 3, horizontal: true, length: 2 },
  { column: 7, row: 7, horizontal: true, length: 2 },

  // Horizontal lines starting in 9th column
  { column: 8, row: 1, horizontal: true, length: 1 },
  { column: 8, row: 2, horizontal: true, length: 1 },
  { column: 8, row: 3, horizontal: true, length: 1 },
  { column: 8, row: 4, horizontal: true, length: 2 },
  { column: 8, row: 8, horizontal: true, length: 2 },

  // Vertical lines after the 1st column
  { column: 1, row: 1, horizontal: false, length: 2 },
  { column: 1, row: 4, horizontal: false, length: 2 },

  // Vertical lines after the 2nd column
  { column: 2, row: 2, horizontal: false, length: 2 },
  { column: 2, row: 5, horizontal: false, length: 1 },
  { column: 2, row: 7, horizontal: false, length: 2 },

  // Vertical lines after the 3rd column
  { column: 3, row: 0, horizontal: false, length: 1 },
  { column: 3, row: 4, horizontal: false, length: 1 },
  { column: 3, row: 6, horizontal: false, length: 2 },

  // Vertical lines after the 4th column
  { column: 4, row: 1, horizontal: false, length: 2 },
  { column: 4, row: 6, horizontal: false, length: 1 },

  // Vertical lines after the 5th column
  { column: 5, row: 0, horizontal: false, length: 2 },
  { column: 5, row: 6, horizontal: false, length: 1 },
  { column: 5, row: 8, horizontal: false, length: 1 },

  // Vertical lines after the 6th column
  { column: 6, row: 4, horizontal: false, length: 1 },
  { column: 6, row: 6, horizontal: false, length: 1 },

  // Vertical lines after the 7th column
  { column: 7, row: 1, horizontal: false, length: 4 },
  { column: 7, row: 7, horizontal: false, length: 2 },

  // Vertical lines after the 8th column
  { column: 8, row: 2, horizontal: false, length: 1 },
  { column: 8, row: 4, horizontal: false, length: 2 },

  // Vertical lines after the 9th column
  { column: 9, row: 1, horizontal: false, length: 1 },
  { column: 9, row: 5, horizontal: false, length: 2 },
].map((wall) => ({
  x: wall.column * (pathW + wallW),
  y: wall.row * (pathW + wallW),
  horizontal: wall.horizontal,
  length: wall.length * (pathW + wallW),
}));

// Draw walls
walls.forEach(({ x, y, horizontal, length }) => {
  const wall = document.createElement("div");
  wall.setAttribute("class", "wall");
  wall.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${wallW}px;
        height: ${length}px;
        transform: rotate(${horizontal ? -90 : 0}deg);
      `;

  mazeElement.appendChild(wall);
});

const holes = [
  { column: 0, row: 5 },
  { column: 2, row: 0 },
  { column: 2, row: 4 },
  { column: 4, row: 6 },
  { column: 6, row: 2 },
  { column: 6, row: 8 },
  { column: 8, row: 1 },
  { column: 8, row: 2 },
].map((hole) => ({
  x: hole.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
  y: hole.row * (wallW + pathW) + (wallW / 2 + pathW / 2),
}));

joystickHeadElement.addEventListener("mousedown", function (event) {
    if (!gameInProgress) {
      mouseStartX = event.clientX;
      mouseStartY = event.clientY;
      gameInProgress = true;
      window.requestAnimationFrame(main);
      noteElement.style.opacity = 0;
      joystickHeadElement.style.cssText = `
            animation: none;
            cursor: grabbing;
          `;
    }
  });
  
  window.addEventListener("mousemove", function (event) {
    if (gameInProgress) {
      const mouseDeltaX = -Math.minmax(mouseStartX - event.clientX, 15);
      const mouseDeltaY = -Math.minmax(mouseStartY - event.clientY, 15);
  
      joystickHeadElement.style.cssText = `
            left: ${mouseDeltaX}px;
            top: ${mouseDeltaY}px;
            animation: none;
            cursor: grabbing;
          `;
  
      const rotationY = mouseDeltaX * 0.8; // Max rotation = 12
      const rotationX = mouseDeltaY * 0.8;
  
      mazeElement.style.cssText = `
            transform: rotateY(${rotationY}deg) rotateX(${-rotationX}deg)
          `;
  
      const gravity = 2;
      const friction = 0.01; // Coefficients of friction
  
      accelerationX = gravity * Math.sin((rotationY / 180) * Math.PI);
      accelerationY = gravity * Math.sin((rotationX / 180) * Math.PI);
      frictionX = gravity * Math.cos((rotationY / 180) * Math.PI) * friction;
      frictionY = gravity * Math.cos((rotationX / 180) * Math.PI) * friction;
    }
  });
  
  window.addEventListener("keydown", function (event) {
    // If not an arrow key or space or H was pressed then return
    if (![" ", "H", "h", "E", "e"].includes(event.key)) return;
  
    // If an arrow key was pressed then first prevent default
    event.preventDefault();
  
    // If space was pressed restart the game
    if (event.key == " ") {
      resetGame();
      return;
    }
  
    // Set Hard mode
    if (event.key == "H" || event.key == "h") {
      hardMode = true;
      resetGame();
      return;
    }
  
    // Set Easy mode
    if (event.key == "E" || event.key == "e") {
      hardMode = false;
      resetGame();
      return;
    }
  });
  
  function resetGame() {
    previousTimestamp = undefined;
    gameInProgress = false;
    mouseStartX = undefined;
    mouseStartY = undefined;
    accelerationX = undefined;
    accelerationY = undefined;
    frictionX = undefined;
    frictionY = undefined;
  
    mazeElement.style.cssText = `
          transform: rotateY(0deg) rotateX(0deg)
        `;
  
    joystickHeadElement.style.cssText = `
          left: 0;
          top: 0;
          animation: glow;
          cursor: grab;
        `;
  
    if (hardMode) {
      noteElement.innerHTML = `Click the joystick to start!
            <p>Hard mode, Avoid black holes. Back to easy mode? Press E</p>`;
    } else {
      noteElement.innerHTML = `Click the joystick to start!
            <p>Move every ball to the center. Ready for hard mode? Press H</p>`;
    }
    noteElement.style.opacity = 1;
  
    balls = [
      { column: 0, row: 0 },
      { column: 9, row: 0 },
      { column: 0, row: 8 },
      { column: 9, row: 8 },
    ].map((ball) => ({
      x: ball.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
      y: ball.row * (wallW + pathW) + (wallW / 2 + pathW / 2),
      velocityX: 0,
      velocityY: 0,
    }));
  
    if (ballElements.length) {
      balls.forEach(({ x, y }, index) => {
        ballElements[index].style.cssText = `left: ${x}px; top: ${y}px; `;
      });
    }
  
    // Remove previous hole elements
    holeElements.forEach((holeElement) => {
      mazeElement.removeChild(holeElement);
    });
    holeElements = [];
  
    // Reset hole elements if hard mode
    if (hardMode) {
      holes.forEach(({ x, y }) => {
        const ball = document.createElement("div");
        ball.setAttribute("class", "black-hole");
        ball.style.cssText = `left: ${x}px; top: ${y}px; `;
  
        mazeElement.appendChild(ball);
        holeElements.push(ball);
      });
    }
  }