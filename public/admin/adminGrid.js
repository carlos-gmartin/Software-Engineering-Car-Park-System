// Canvas size
var canvasX = 1200;
var canvasY = 1200;

// Number of columns and rows
var rows = 10;
var cols = 10;
// Size of each cell
var cellSize = 100;

function setup() {
     // var canvas = createCanvas(canvasX, canvasY);
    //frameRate(60);
}

function draw() {
  stroke(0);
}

// Draw grid
function drawGrid(){
// Ajax request for server database.
  $.ajax({
    url: "/getBookings",
    type: "GET",
    dataType: "json",
    success: function(returnedArray) {
      console.log(returnedArray);
      var counter = 0;
      for(var y = 0; y < 10; y++) {
        for(var x = 0; x < 10; x++) {
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



// create Grid button
document.addEventListener("DOMContentLoaded", function(event) { 
    document.getElementById('createGrid').addEventListener("click", function() {
        do{
            var rowSize = parseInt(window.prompt("Please enter a desired car park size to be created," + "rows: "), 10);
            var colSize = parseInt(window.prompt("Please enter a desired car park size to be created," + "cols: "), 10);
        }
        while(isNaN(rowSize) || rowSize > 100 || rowSize < 1 || isNaN(colSize) || colSize > 100 || colSize < 1);

        var result = window.confirm("Are you sure you want to create a car park of size: " + rowSize + "," + colSize);
        if(result == true){
            $.ajax({
                url: "/createGridButton",
                type: "POST",
                data: { 
                    rowSize: rowSize,
                    colSize: colSize
                },
                dataType: "json",
                success: function(response) {
                    alert('Car park created successfully grid of size: ' + response);
                }
            });
        }
        else{
            alert("Car Park was cancelled.");
        }
    });
  });