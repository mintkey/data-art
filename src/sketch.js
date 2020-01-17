// variables
let maxDiameter = 10;
let xspacing = 15; // distance between each horizontal point
let w; // width of entire wave
let theta = 0.0; // start angle at 0
let amplitude = 75.0; // height of wave
let period = 200.0; // number of pixels per wave
let dx; // value for incrementing x
let yvalues; // array to store height values for the wave
var isSetup = false;

function setup() {
  var canvas = createCanvas(700, 600);
  canvas.parent("p5canvas");

  // parameters
  colorMode(RGB, 255);
  rectMode(CENTER);

}

function draw() {
  // clear canvas
  clear();
  background('#000000');

  // if the app has not yet loaded (no Spotify data) then don't run P5 code
  if (app.loaded == false) {
    return;
  }

  // valence dependent shape fluctuation
  // - higher valence means really small to really large, lower valence means
  // slightly small to slightly large
  isSetup = true;
  if(model.track == null){
    $.each(model.track.features, function(key, value) {
      if (key == "valence") {
        maxDiameter += value;
      }
    });
    w = width + 20;
    dx = (TWO_PI / period) * xspacing;
    yvalues = new Array(floor(w / xspacing));
    // time signature-dependent period
    $.each(model.track.features, function(key, value) {
      if (key == "time_signature") {
        period *= value;
      }
    });
  }

  coloring();
  calculateWave();
  renderWave();
  
}

function calculateWave() {
  // tempo-dependent angular velocity
  $.each(model.track.features, function(key, value) {
    if (key == "tempo") {
      theta += 0.0005 * value;
    }
  });

  // for every x value, calculate a y value with sine function
  let x = theta;
  for (let i = 0; i < yvalues.length; i++) {
    yvalues[i] = sin(x) * amplitude;
    x += dx;
  }
}

function renderWave() {
  noStroke();
	//fill('#ffd54f');
  // draw the wave with an ellipse at each point
  for (let x = 0; x < yvalues.length; x++) {
    var diameter = 15 + sin(theta) * maxDiameter;
    if (app.viz.songshape == "circle") {
      ellipse(x * xspacing, height / 2 + yvalues[x], diameter, diameter);
    }
    else if (app.viz.songshape == "square") {
      rect(x * xspacing, height / 2 + yvalues[x], diameter, diameter);
    }
  }
}

function coloring() {
  var r = map(app.viz.color, 0,1,0,0);
  var g = map(app.viz.color, 0,1,191,255);
  var b = map(app.viz.color, 0,1,255,0);
  
  fill(r,g,b);

}
