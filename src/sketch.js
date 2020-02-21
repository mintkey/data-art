let maxDiameter = 10;
let xspacing = 15; // Distance between each horizontal point
let w; // Width of entire wave
let theta = 0.0; // Start angle at 0
let amplitude = 75.0; // Height of wave
let period = 200.0; // Number of pixels per wave
let dx; // Value for incrementing x
let yvalues; // Array to store height values for the wave
var isSetup = false;

function setup() {
  var canvas = createCanvas(700, 600);
  canvas.parent("p5canvas");
  rectMode(CORNER);
  ellipseMode(CENTER);
}

//create a reference to list of selected tracks
var tracks = datamodel.selectedTracks;

function draw() {
  clear();

  // If the app has not loaded yet then don't run P5 code
  if (app.loaded == false) {
    return;
  }

  //if exploring all tracks
  if(app.exploreState == "all"){
    //loop through all selected tracks
    for(var i=0; i<tracks.length; i++){
      plotTrack(i);
    }
  }

  //if only viewing a single track
  if(app.exploreState != "all"){
    plotTrack(app.exploreState);
  }

  noLoop();
}

function plotTrack(trackIndex){

  //setup the constraints
  var maxCircleSize = 600;
  var minCircleSize = 50;

  //grab the values from the track object
  var valence = tracks[trackIndex].features.valence;
  var trackname = tracks[trackIndex].name;

  //map the values if necessary
  var circleWidth = map(valence,0,1,minCircleSize,maxCircleSize);

  //draw the circle
  var col = color(255,0,0);
  noFill();
  stroke(col);
  ellipse(width/2,height/2,circleWidth,circleWidth);
  fill(col);
  var textXPos = (width/2)-(textSize(trackname)/2);
  var textYPos = (height/2)-(circleWidth/2)-5;
  text(trackname + " (" +valence+ ")",textXPos,textYPos);

}

  /*
  //Valence-dependent shape fluctuation:
  //Higher valence means really small to really large, lower valence means
  //slightly small to slightly large

  isSetup = true;
  if (model.track == null) {
    $.each(model.track.features, function (key, value) {
      if (key == "valence") {
        maxDiameter += value;
      }
    });
    w = width + 20;
    dx = (TWO_PI / period) * xspacing;
    yvalues = new Array(floor(w / xspacing));
    // Time signature-dependent period
    $.each(model.track.features, function (key, value) {
      if (key == "time_signature") {
        period *= value;
      }
    });
  }

  coloring();
  calculateWave();
  renderWave();
  */

//}

/*
function calculateWave() {
  // Tempo-dependent angular velocity
  $.each(model.track.features, function (key, value) {
    if (key == "tempo") {
      theta += 0.0005 * value;
    }
  });

  // For every x value, calculate a y value with sine function
  let x = theta;
  for (let i = 0; i < yvalues.length; i++) {
    yvalues[i] = sin(x) * amplitude;
    x += dx;
  }
}

function renderWave() {
  noStroke();
  // fill('#ffd54f');
  // Draw the wave with an ellipse at each point
  for (let x = 0; x < yvalues.length; x++) {
    var diameter = 15 + sin(theta) * maxDiameter;
    if (app.viz.songshape == "circle") {
      ellipse(x * xspacing, height / 2 + yvalues[x], diameter, diameter);
    } else if (app.viz.songshape == "square") {
      rect(x * xspacing, height / 2 + yvalues[x], diameter, diameter);
    }
  }
}

function coloring() {
  var r = map(app.viz.color, 0, 1, 0, 0);
  var g = map(app.viz.color, 0, 1, 191, 255);
  var b = map(app.viz.color, 0, 1, 255, 0);

  fill(r, g, b);
}
*/