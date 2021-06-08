let width;
let height;

let scl = 25;

let probability = 0.25;

let iterations = 1000;
let iter;

let start, end;

let rows, cols;
let grid;

let openSet, closedSet, path;

let stopPathFinding;
let pauseLoop;

Array.prototype.containsArray = function(elem) {
  let hash = {};
  this.forEach((val) => {
    hash[val] = val;
  });
  return hash.hasOwnProperty(elem);
}

Array.prototype.indexOfArray = function(elem) {
  let found = false;
  for(let index = 0; index < this.length; index++) {
    found = true;
    for(let num = 0; num < elem.length; num++) {
      if(this[index][num] != elem[num]) found = false;
    }
    if(found) return index;
  }
  return -1;
}

Array.prototype.removeAtIndex = function(index) {
  this.splice(index, 1);
}

function createRandomObstacles() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if ((x == start[0] && y == start[1]) || (x == end[0] && y == end[1])) {
        grid[x][y].wall = false;
      }
      else if (random() < probability) {
        grid[x][y].wall = true;
      }
    }
  }
}

function createGrid() {
  grid = new Array(cols);

  for (let x = 0; x < cols; x++) {
    grid[x] = new Array(rows);
  }

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if([start].containsArray([x,y])) {
        grid[x][y] = new Node(x, y, scl);
      } else {
        grid[x][y] = new Node(x, y, scl);
      }
    }
  }
  openSet.push(grid[start[0]][start[1]]);
  
  createRandomObstacles();

  // drawGrid();
}

function drawPath(currentNode) {
  path = [];
  let tempNode = currentNode;
  // path.push(tempNode);
  while(tempNode.previous) {
    path.push(tempNode);
    tempNode = tempNode.previous;
  }
  path.push(grid[start[0]][start[1]]);
  
  // let r = frameCount / 100;
  // let g = frameCount / 100;
  let r = 0;
  let g = 0;
  // if(g >= 255) g = 0;
  // if(r >= 255) r = 0;
  noFill();
  stroke(random(255)*2, random(255)*2, random(255)*2, 15);
  strokeWeight(scl / 4);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    // stroke(r, g, 0, 10);
    vertex(path[i].x * scl + scl / 2, path[i].y * scl + scl / 2);
    r += 3;
    g += 4;
  }
  endShape();
}

function drawGrid() {
  let alpha = 100;
  stroke(0, 0, 0);
  strokeWeight(1);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (openSet.includes(grid[x][y])) {
        fill(0, 255, 0, alpha);
      }
      else if (closedSet.includes(grid[x][y])) {
        fill(255, 0, 0, alpha);
      }
      else if (grid[x][y].wall) {
        fill(0);    // draw wall
      }
      else {
        fill(255);  // draw open space
      }
      rect(grid[x][y].coord[0], grid[x][y].coord[1], scl, scl);
    }
  }
}

function initPathFinding() {
  rows = Math.floor(height / scl);
  cols = Math.floor(width / scl);

  start = [rows / 2, cols / 2];
  end = [cols - 1, rows - 1];

  openSet = [];
  closedSet = [];

  stopPathFinding = false;
}

function getValidNeighbors(node) {
  let neighborNodes = [];

  let neighbors = [ 0, 1, 0, 
                    1, 0, 1,
                    0, 1, 0 ];

  let index = 0;
  for (let y = 1; y >= -1; y--) {
    for (let x = -1; x <= 1; x++) {
      if(neighbors[index] != 0) {
        let xDir = node.x + x;
        let yDir = node.y + y;
        if(xDir >= 0 && xDir <= cols - 1 &&
           yDir >= 0 && yDir <= rows - 1 &&
           !grid[xDir][yDir].wall) {
             neighborNodes.push(grid[xDir][yDir]);
           }
      }
      index += 1;
    }
  }

  return neighborNodes;
}

function getNodeDistance(a, b) {
  return Math.abs(Math.sqrt(Math.pow(a.x - b.x, 2)+ Math.pow(a.y - b.y, 2)));
}

function resetSketch() {
  background(255);

  initPathFinding();
  createGrid(width, height);

  grid[0][0].wall = true;
  grid[end[0]][end[1]].wall = true;
  iter = 0;
  stopPathFinding = false;
  pauseLoop = 0;
}

function setup() {
  width = windowWidth;
  height = windowHeight;
  createCanvas(width+1, height+1);
  resetSketch();
}

function draw() {
  if(!stopPathFinding) {
    if(iter >= iterations) {
      end = [0, 0];
      iter = 0;
    }
    // while openSet is not empty
    if(openSet.length != 0) {
      // background(255);
      // finds lowest f cost node in openSet
      let currentNode = openSet.reduce((prev, curr) => {
        return prev.f < curr.f ? prev : curr;
      });

      if(currentNode === grid[end[0]][end[1]]){
        console.log("Reached the goal!");
        stopPathFinding = true;
      }

      openSet.removeAtIndex(openSet.indexOf(currentNode));
      closedSet.push(currentNode);
      
      getValidNeighbors(currentNode).forEach((neighbor) => {
        if(!closedSet.includes(neighbor)){
          neighbor.g = grid[neighbor.x][neighbor.y].g + 1; //heuristic();

          let newPath = false;
          let index = openSet.indexOf(neighbor);
          if(index != - 1) {
            if(neighbor.g > openSet[index].g) {
              grid[neighbor.x][neighbor.y].g = neighbor.g;
              newPath = true;
            }
          } else {
            grid[neighbor.x][neighbor.y].g = neighbor.g;
            newPath = true;
            openSet.push(neighbor);
          }

          if(newPath) {
            neighbor.h = getNodeDistance(neighbor, grid[end[0]][end[1]]);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = currentNode;
          }
  
        }
      });
      drawPath(currentNode);
      iter += 1;
      // drawGrid();
    } else {
      console.log("No solution!");
      // stopPathFinding = true;
      if(pauseLoop >= 150) {
        resetSketch();
      }
      pauseLoop++;
    }
  }
}