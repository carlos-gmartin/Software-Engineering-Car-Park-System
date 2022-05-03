// Canvas size
var canvasX = 1200;
var canvasY = 600;

// Number of columns and rows
var cols = 12;
var rows = 6;
// Size of the overall grid
var size = 100;

function setup() {
  var canvas = createCanvas(canvasX, canvasY);
  canvas.parent('grid');
  frameRate(0.5);
}

function draw() {
  background(250);
  stroke(0);
  for (let x = 0; x < cols; x++){
    console.log(`the first for loop has executed ${x} times`);
   for (let y = 0; y < rows; y++){
     rect(size * x, size * y, size, size);
     $.ajax({
       url: "/getBookings",
       type: "POST",
       data: {
         "x": x,
         "y": y
       },
       dataType: "json",
       success: function(currentBookings) {
         console.log(currentBookings.colour)
         var fillColour = currentBookings.colour
         fill(fillColour)
          console.log(currentBookings);
       },
       error: function(xhr,status,err) {
          alert("Error can't connect to server");
       }
     });
     text(`x:${x} y:${y}`, 100 * x + 15, 100 * y + 15);
     
    console.log(`the second for loop has executed ${y} times`);
   }
  }
}

function mousePressed() {
  stroke(0);
  let x = Math.floor(mouseY / size);
  let y = Math.floor(mouseX / size);
  fill("blue");
  rect(y * size, x * size, size, size);
}

function geolocation() {
  navigator.geolocation.getCurrentPosition(sendGeolocation);
}

function sendGeolocation(position) {
  var GPSFormat = {
    "Latitude": position.coords.latitude,
    "Longitude": position.coords.longitude
  }
  $.ajax({
    url: "/GPS",
    type: "POST",
    data: GPSFormat,
    dataType: "json",
    success: function(returnedStatement) {
      console.log(returnedStatement);
    },
    error: function(xhr, status, err) {
      alert("Error can't connect to server");
    }
  });
  console.log("Latitude: " + position.coords.latitude);
  console.log("Longitude: " + position.coords.longitude);
}
