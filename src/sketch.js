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
}

function draw() {
  clear();

  // If the app has not loaded yet then don't run P5 code
  if (app.loaded == false) {
    return;
  }

  var tracks = datamodel.selectedTracks;

  for(var i=0; i<tracks.length; i++){
    var barHeight = 20;
    var yPos = (i*(barHeight+2))+10;
    var valence = tracks[i].features.valence;
    var valenceWidth = map(valence,0,1,0,350);

    fill("black")
    text(tracks[i].name,0,yPos+2);
    rect(100,yPos - (barHeight/2),350,20);
    fill("#ffcc00");
    rect(100,yPos - (barHeight/2),valenceWidth,20);
    fill("black");
    text("Valence: "+valence,100,yPos+2);
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

}

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