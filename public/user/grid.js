// Canvas size
var canvasX = 1000;
var canvasY = 1000;

var rows;
var cols;

// Size of each cell
var cellSize = 100;

/*
*
* Drawing the grid and initial setup for the grid.
*
*/

async function setup() {
  gridSize = await getGridSize();
  canvasX = 100 * gridSize[0];
  canvaxY = 100 * gridSize[1];
  console.log(canvasX);
  var canvas = createCanvas(canvasX, canvasY);
  canvas.parent('grid');
  console.log(gridSize[0]);
  rows = gridSize[0];
  console.log(gridSize[1]);
  cols = gridSize[1];
  // console.log(gridSize);
  frameRate(60);
}

function draw() {
  //console.log("Trying to draw!");
  stroke(0);
  //console.log(rows);
  //console.log(cols);
  // Ajax request for server database.
  $.ajax({
    url: "/getBookings",
    type: "GET",
    dataType: "json",
    success: function(returnedArray) {
      //console.log(returnedArray);
      var counter = 0;
      for(var y = 0; y < cols; y++) {
        for(var x = 0; x < rows; x++) {
          if(returnedArray[counter] == 1) {
            fill("green");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            fill("white");
            text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
          } else if(returnedArray[counter] == 2) {
            fill("grey");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            fill("white");
            text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
          } else if (returnedArray[counter] == 3) {
            fill("black");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            fill("white");
            text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
          }
          else{
            nofill();
          }
          counter++;
        }
      }
      mouseHover();    
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

/*
*
* Buttons list
*
*/
function mouseClicked(){
	noFill();
  let x = Math.floor(mouseX / cellSize);
  let y = Math.floor(mouseY / cellSize);
  fill("red");
  rect(x * cellSize, y * cellSize, cellSize, cellSize);
  text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
  gatherSpace(x, y);
}

function mouseHover(){
	noFill();
  let x = Math.floor(mouseX / cellSize);
  let y = Math.floor(mouseY / cellSize);
  if(x < rows && y < cols){
    if(x >= 0 && y >= 0){
      fill("#6C5B7B");
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
      text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
      gatherSpace(x, y);
    }
  }
}


function clickedSpace(){



}


function gatherSpace(positionX, positionY){
  $.ajax({
    url: "/gatherSpaceInformation",
    type: "POST",
    data: { 
        positionX: positionX,
        positionY: positionY
    },
    dataType: "json",
    success: function(spaceInfo) {
      var positionX = spaceInfo[0];
      var positionY = spaceInfo[1];
      var cost = spaceInfo[2];
      var timing = spaceInfo[3];
      if(spaceInfo != null){
        document.getElementById("cost").innerHTML = "Cost: " + cost;
        document.getElementById("timing").innerHTML = "Booking timing: " + timing;
        document.getElementById("location").innerHTML = "Location: " + "Row: " + positionX + " " + "Column: " + positionY;
      }
    }
  });
}
