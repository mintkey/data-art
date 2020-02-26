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

// Create a reference to the list of selected tracks
var tracks = datamodel.selectedTracks;

function draw() {
  clear();

  // If the app has not loaded yet then don't run P5 code
  if (app.loaded == false) {
    return;
  }

  // If exploring all tracks, loop through all selected tracks to plot
  if (app.exploreState == "all") {
    for (var i = 0; i < tracks.length; i++) {
      plotTrack(i);
    }
  }

  // If only viewing a single track, plot only the selected track
  if (app.exploreState != "all") {
    plotTrack(app.exploreState);
  }

  // Create the grid
  plotDimensions();

  noLoop();
}

function plotDimensions() {
  // Plots for energy
  var lineCol = color("#AAAAAA");
  strokeWeight(1);
  stroke(lineCol);
  line(width / 2, height / 2, width, height / 2);
  fill(lineCol);
  text("low", width / 2, height / 2);
  text("medium", width / 2 + ((width / 2) / 2), height / 2);
  text("high", width - 30, height / 2);
}


function plotTrack(trackIndex) {

  // Constraints for circumference
  var maxCircleSize = 600;
  var minCircleSize = 50;

  var valence = tracks[trackIndex].features.valence;
  var energy = tracks[trackIndex].features.energy;
  var trackname = tracks[trackIndex].name;

  // Map values if necessary
  var circleWidth = map(valence, 0, 1, minCircleSize, maxCircleSize);
  var colorChannel = map(energy, 0, 1, 0, 255);
  var strokeSize = map(energy, .2, 1, 0.1, 5);

  // Draw track circle
  var col = color(colorChannel, 0, 0);
  noFill();
  stroke(col);
  strokeWeight(strokeSize);
  ellipse(width / 2, height / 2, circleWidth, circleWidth);
  fill(col);
  var textXPos = (width / 2) - (textSize(trackname) / 2);
  var textYPos = (height / 2) - (circleWidth / 2) - 5;
  strokeWeight(1);
  text(trackname + " (" + valence + ")", textXPos, textYPos);

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