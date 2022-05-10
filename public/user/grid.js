// Canvas size
var canvasX = 1200;
var canvasY = 1200;

var rows;
var cols;

// Size of each cell
var cellSize = 100;

function setup() {
  var canvas = createCanvas(canvasX, canvasY);
  canvas.parent('grid');
  getGridSize();
  rows = 6;
  cols = 5;
  // console.log(gridSize);
  frameRate(20);
}

function draw() {
  stroke(0);
  // Ajax request for server database.
  $.ajax({
    url: "/getBookings",
    type: "GET",
    dataType: "json",
    success: function(returnedArray) {
      // console.log(returnedArray);
      var counter = 0;
      for(var y = 0; y < cols; y++) {
        for(var x = 0; x < rows; x++) {
          if(returnedArray[counter] == 1) {
            fill("green");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            text(`x:${x} y:${y}`, 100 * x + 15, 100 * y + 15);
          } else if(returnedArray[counter] == 2) {
            fill("grey");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            text(`x:${x} y:${y}`, 100 * x + 15, 100 * y + 15);
          } else {
            fill("red");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            text(`x:${x} y:${y}`, 100 * x + 15, 100 * y + 15);
          }
          counter++;
        }
      }
    }
  })
}

async function getGridSize(){
  var gridSizeLocal;
  await $.ajax({
    url: "/getGridSize",
    type: "GET",
    dataType: "json",
    success: function(gridSize) {
      console.log("Grid sized: " + gridSize);
      gridSizeLocal = gridSize;     
    }
  })
  console.log(gridSizeLocal);
  return gridSizeLocal;
}

// function mousePressed() {
//   stroke(0);
//   let x = Math.floor(mouseY / size);
//   let y = Math.floor(mouseX / size);
//   fill("blue");
//   rect(y * size, x * size, size, size);
// }
