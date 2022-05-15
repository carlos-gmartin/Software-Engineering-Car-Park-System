// Canvas size
var canvasX = 1000;
var canvasY = 1000;

var rows;
var cols;

// Size of each cell
var cellSize = 70;

var state = 0;

/*
*
* Drawing the grid and initial setup for the grid.
*
*/

var NameOfGrid = "Test";

async function setup(NameOfGrid) {
  NameOfGrid = "Test";
  console.log(NameOfGrid);
  gridSize = await getGridSize(NameOfGrid);
  canvasX = cellSize * gridSize[0];
  canvaxY = cellSize * gridSize[1];
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
  //console.log("Trying to draw!");
  stroke(0);
  //console.log(rows);
  //console.log(cols);
  // Ajax request for server database.
  var NameOfGrid = "Test"
  $.ajax({
    url: "/getBookings",
    type: "POST",
    dataType: "json",
    data: {
      name: NameOfGrid
    },
    success: function(returnedArray) {
      //console.log(returnedArray);
      var counter = 0;
      for(var y = 0; y < cols; y++) {
        for(var x = 0; x < rows; x++) {
          //console.log(returnedArray);
          if(returnedArray[counter] == 1) {
            fill("green");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            //fill("white");
            text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
            //console.log("Making green square!");
          } else if(returnedArray[counter] == 2) {
            fill("grey");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            //fill("white");
            text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
            //console.log("Making grey square!");
          } else if (returnedArray[counter] == 3) {
            fill("black");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            //fill("white");
            text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
            //console.log("Making black square!");
          } else {
            fill("red");
            rect(cellSize * x, cellSize * y, cellSize, cellSize);
            text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);
            //console.log("Making red square!");
          }
          counter++;
        }
        mouseHover();
      }
    }
  })
}
async function getGridSize(name){
  var gridSizeLocal;
  await $.ajax({
    url: "/getGridSize",
    type: "POST",
    dataType: "json",
    data: {
      name: name
    },
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

function mouseHover(){
	noFill();
  let x = Math.floor(mouseX / cellSize);
  let y = Math.floor(mouseY / cellSize);
  if(x < rows && y < cols){
    if(x >= 0 && y >= 0){
      fill("#6C5B7B");
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
      text(`x:${x} y:${y}`, cellSize * x + 15, cellSize * y + 15);

      var spaceInfo = gatherSpace(x, y, '/gatherSpaceInformation');

      if(spaceInfo != null){
          
        var positionX = spaceInfo[0];
        var positionY = spaceInfo[1];
        var cost = spaceInfo[2];
        var timing = spaceInfo[3];

        document.getElementById("cost").innerHTML = "Cost: " + cost;
        document.getElementById("timing").innerHTML = "Booking timing: " + timing;
        document.getElementById("location").innerHTML = "Location: " + "Row: " + positionX + " " + "Column: " + positionY;
      }
    }
  }
}

/*

FIX THE GRID NOT APPEARING...


*/

// Clicked on the reserve button.
document.addEventListener("DOMContentLoaded", function(event) { 

  document.getElementById("logOut").addEventListener("click", function(){
    window.location = "/Login";
  });
  // Get currently logged in user balance.
  gatherBalance();

  document.getElementById('reserve').addEventListener("click", function(){ 
    do{
      var positionX = parseInt(window.prompt("Please enter position X : "), 10);
      var positionY = parseInt(window.prompt("Please enter position Y : "), 10);
    }
    while(isNaN(positionX) && positionX >= 0 && isNaN(positionY) && positionY >= 0 && positionX <= rows && positionY <= cols);
    var NameOfGrid = "Test";
    $.ajax({
      url: '/gatherSpaceInformation',
      type: "POST",
      data: { 
          name: NameOfGrid,
          positionX: positionX,
          positionY: positionY
      },
      dataType: "json",
      success: function(spaceInfo) {
      console.log(spaceInfo);
        // Code to check that user has enough balance !!!


        console.log(spaceInfo[4]);
        console.log((spaceInfo[4] == 'false') || (spaceInfo[4] == 0));
        if(spaceInfo[4] == 'false' || spaceInfo[4] == 0){
          var result = window.confirm("Do you want to reserve this space: " + spaceInfo[0] + "," + spaceInfo[1]);
            if(result == true){
              var NameOfGrid = "Test";
              $.ajax({
                url: "/bookSpace",
                type: "POST",
                data: { 
                    name: NameOfGrid,
                    positionX: spaceInfo[0],
                    positionY: spaceInfo[1],
                },
                dataType: "json",
                success: function(response) {
                    alert("Booked position: " + response[0] + ":" + response[1]);
                    gatherBalance();
                    // Update grid size.
                }
              });
            }
          }
          else{
            window.confirm("Cannot book this current space as it has already been booked:" + spaceInfo[0] + "," + spaceInfo[1]);
          }
        }
      });
    })
});


var space;
function gatherSpace(positionX, positionY, url){
  var NameOfGrid = "Test";
  console.log(NameOfGrid);
  $.ajax({
    url: url,
    type: "POST",
    data: { 
        name: NameOfGrid,
        positionX: positionX,
        positionY: positionY
    },
    dataType: "json",
    success: function(spaceInfo) {
      space = spaceInfo;
    }
  });
  return space;
}


function gatherBalance(){
  var NameOfGrid = "Test";
  console.log(NameOfGrid);
  $.ajax({
    url: "/getBalance",
    type: "GET",
    dataType: "json",
    success: function(balance) {
      userBalance = balance;
      document.getElementById("balance").innerHTML = "Balance" + userBalance;
    }
  });
}


/*$document.ready(function() {
  $.ajax({
    url: "/getCarParkDropdown",
    type: "GET",
    dataType: "json",
    success: function(carParks) {
      for (var index = 0; index <= carParks.length; index++){
        $('#carParkSelect').append('<option value ="' + data[index] + '">' + data[index] + '</option>');
      }
      console.log(carParks);
    }
  })

}); */


