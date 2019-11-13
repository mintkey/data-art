// variables
let maxDiameter = 10;
let xspacing = 15; // distance between each horizontal point
let w; // width of entire wave
let theta = 0.0; // start angle at 0
let amplitude = 75.0; // height of wave
let period = 200.0; // number of pixels per wave
let dx; // value for incrementing x
let yvalues; // array to store height values for the wave

function setup() {
  var canvas = createCanvas(700, 600);
  canvas.parent("p5canvas");

  // parameters
  colorMode(RGB, 255);
  rectMode(CENTER);

	// valence dependent shape fluctuation
	// - higher valence means really small to really large, lower valence means
	// slightly small to slightly large
	$.each(app.track.features, function(key, value) {
    if (key == "valence") {
      maxDiameter += value;
    }
  });
  w = width + 20;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w / xspacing));
	// time signature-dependent period
  $.each(app.track.features, function(key, value) {
    if (key == "time_signature") {
      period *= value;
    }
  });
}

function draw() {
  // clear canvas
  clear();
  background('#f5f5f5');

  // if the app has not yet loaded (no Spotify data) then don't run P5 code
  if (app.loaded == false) {
    return;
  }

  // display the color based on the color variable
  coloring();

  if (app.viz.songshape == "circle") {
    calculateWave();
    renderWaveCircles();
  } else if (app.viz.songshape == "square") {
    calculateWave();
    renderWaveSquares();
  }
}

function calculateWave() {
  // tempo-dependent angular velocity
  $.each(app.track.features, function(key, value) {
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

function renderWaveCircles() {
  noStroke();
	//fill('#ffd54f');
  // draw the wave with an ellipse at each point
  for (let x = 0; x < yvalues.length; x++) {
    var diameter = 15 + sin(theta) * maxDiameter;
    ellipse(x * xspacing, height / 2 + yvalues[x], diameter, diameter);
  }
}

function renderWaveSquares() {
  // draw the wave with a rectangle at each point
  for (let x = 0; x < yvalues.length; x++) {
    var diameter = 15 + sin(theta) * maxDiameter;
    rect(x * xspacing, height / 2 + yvalues[x], diameter, diameter);
  }
}

function coloring() {
  /*
  if (app.viz.color == "energy") {
    fill(114, 224, 142);
  } else if (app.viz.color == "danceability") {
    fill(174, 235, 226);
  } else if (app.viz.color == "valence") {
    fill(255, 105, 125);
  }
  */
  var r = map(app.viz.color, 0,1,0,0);
  var g = map(app.viz.color, 0,1,191,255);
  var b = map(app.viz.color, 0,1,255,0);
  fill(r,g,b);

}
