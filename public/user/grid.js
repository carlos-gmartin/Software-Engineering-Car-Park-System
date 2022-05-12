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
  frameRate(20);
}
function draw() {
  console.log("Trying to draw!");
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

/*
*
* Buttons list
*
*/


// // reserve space
// document.addEventListener("DOMContentLoaded", function(event) { 
//   document.getElementById('reserve').addEventListener("click", function() {
//       if(result == true){
//           $.ajax({
//               url: "/reserveSpace",
//               type: "POST",
//               data: { 
//                   rowSize: rowSize,
//                   colSize: colSize,
//               },
//               dataType: "json",
//               success: function(response) {
//                   alert('Car park created successfully grid of size: ' + response);
//               }
//           });
//       }
//       else{
//           alert("Car Park was cancelled.");
//       }
//   });
// });

function mousePressed() {
  stroke(0);
  let x = Math.floor(mouseX / cellSize);
  let y = Math.floor(mouseY / cellSize);
  fill("blue");
  rect(y * cellSize, x * cellSize, cellSize, cellSize);
  console.log("Gathering space locations: " + x + ":" + y);
  gatherSpace(x, y);
}


function gatherSpace(positionX, positionY){
  if(positionX > rows || positionY > cols){
    $.ajax({
      url: "/gatherSpaceInformation",
      type: "POST",
      data: { 
          rowSize: positionX,
          colSize: positionY
      },
      dataType: "json",
      success: function(response) {
        console.log(response);
      }
    });
  }
}
