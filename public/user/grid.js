// Canvas size
var canvasX = 1200;
var canvasY = 1200;

// Number of columns and rows
var rows = 10;
var cols = 10;
// Size of each cell
var cellSize = 100;

function setup() {
  var canvas = createCanvas(canvasX, canvasY);
  canvas.parent('grid');
  frameRate(60);
}

function draw() {
  stroke(0);
  /*for (let x = 0; x < cols; x++){
   for (let y = 0; y < rows; y++){
     $.ajax({
       url: "/getBookings",
       type: "POST",
       data: {
         "x": x,
         "y": y
       },
       dataType: "json",
       success: function(currentBookings) {
        rect(cellSize * x, cellSize * y, cellSize, cellSize);
        console.log(currentBookings.colour)
        var fillColour = currentBookings.colour;
        fill(fillColour)
        text(`x:${x} y:${y}`, 100 * x + 15, 100 * y + 15);
        console.log(currentBookings);
       },
       error: function(xhr,status,err) {
          //alert("Error can't connect to server");
       },
       timeout: 1500
     });
      
   }
  } */

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

// function mousePressed() {
//   stroke(0);
//   let x = Math.floor(mouseY / size);
//   let y = Math.floor(mouseX / size);
//   fill("blue");
//   rect(y * size, x * size, size, size);
// }
