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
  frameRate(60);
  noLoop();
}

function draw() {
  background(250);
  stroke(0);
  noFill();

  for (let x = 0; x < cols; x++){
    console.log(`the first for loop has executed ${x} times`);
   for (let y = 0; y < rows; y++){
     rect(size * x, size * y, size, size);
     text(`x:${x} y:${y}`, 100 * x + 15, 100 * y + 15);
    console.log(`the second for loop has executed ${y} times`);
   }
}

}

function mousePressed() {
  stroke(0);
  let x = Math.floor(mouseY / size);
  let y = Math.floor(mouseX / size);
  fill("light-green");
  rect(y * size, x * size, size, size);
}
