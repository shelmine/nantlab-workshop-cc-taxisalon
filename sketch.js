// camera input and skeleton tracking
let video;
let poseNet;
let pose;
let poses;
let poseTimestamp;
let skeleton;

let noseX;
let noseY;
let leftHandX;
let leftHandY;
let rightHandX;
let rightHandY;

// audio input
let mic;
let fft;

// color theme
let backgroundColor;
let primaryColor;
let secondaryColor;
let tertiaryColor;
let quarternaryColor;
let qinaryColor;

// control
// let currentPattern = -1;
let currentPattern = 0;

// pattern 1
let centerX;
let centerY;
var formResolution = 15;
var stepSize = 2;
var distortionFactor = 1;
var initRadius = 150;
var x = [];
var y = [];
let filled = false;

// screen saver
var particles = [];
var particleCount = 2000;
var noiseScale = 100;
var noiseStrength = 20;
var noiseZRange = 0.4;
var noiseZVelocity = 0.01;
var overlayAlpha = 10;
var particleAlpha = 200;
var strokeWidth = 0.3;

function setup() {
  //   TODO: render in webgl, so we can use shaders, but that is for later
  // createCanvas(640, 480, WEBGL);

  var w = window.innerWidth;
  var h = window.innerHeight;

  createCanvas(w, h);
  background(0, 0, 0);

  strokeWeight(1);

  document.addEventListener(
    "click",
    function enableNoSleep() {
      document.removeEventListener("click", enableNoSleep, false);
      //   noSleep.enable();
    },
    false
  );

  //   setup camera input
  video = createCapture(VIDEO);
  video.size(width, height);

  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  //   setup audio input
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  //   lets assign colors here
  backgroundColor = color(0);
  primaryColor = color(38, 70, 83);
  secondaryColor = color(42, 157, 143);
  tertiaryColor = color(233, 196, 106);
  quarternaryColor = color(244, 162, 97);
  quinaryColor = color(231, 111, 81);

  // screen saver
  for (var i = 0; i < particleCount; i++) {
    particles[i] = new Particle(noiseZRange);
  }

  // pattern 1
  centerX = width / 2;
  centerY = height / 2;
  var angle = radians(360 / formResolution);
  for (var i = 0; i < formResolution; i++) {
    x.push(cos(angle * i) * initRadius);
    y.push(sin(angle * i) * initRadius);
  }
}
function mousePressed() {}
function mousePressed() {
  if (key == "s" || key == "S") {
    saveCanvas(getTimestamp(), "png");
  }
}

function gotPoses(results) {
  poses = results;
  if (poses.length > 0) {
    if (!pose) {
      // new person detected
      newPersonDetected = true;
    } else {
      // still the same person
      newPersonDetected = false;
    }
    poseTimestamp = millis();
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  } else {
    pose = null;
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  timestamp = millis();

  //   get audio features
  let spectrum = fft.analyze();
  const bassEnergy = fft.getEnergy("bass");
  const lowMidEnergy = fft.getEnergy("lowMid");
  const highMidEnergy = fft.getEnergy("highMid");
  const trebleEnergy = fft.getEnergy("treble");

  //   get skeleton positions
  if (pose) {
    noseX = pose.nose.x;
    noseY = pose.nose.y;
    leftHandY = pose.leftWrist.y;
    leftHandX = pose.leftWrist.x;
    rightHandY = pose.rightWrist.y;
    rightHandX = pose.rightWrist.x;
  }

  //   finally draw visuals
  if (pose && timestamp < poseTimestamp + 5000) {
    // if there is a pose, then draw one of the patterns
    switch (currentPattern) {
      case -1: {
        fill(backgroundColor);
        rect(0, 0, width, height);
        image(video, 0, 0, width, height);
        drawKeypoints();
        drawSkeleton();
        break;
      }
      case 0: {
        if (newPersonDetected) {
          // clear background if there is a new person
          fill(backgroundColor);
          noStroke();
          rect(0, 0, width, height);
        }
        // floating towards mouse position
        // centerX += (mouseX - centerX) * 0.01;
        // centerY += (mouseY - centerY) * 0.01;

        // centerX += (rightHandX - centerX) * 0.01;
        // centerY += (rightHandY - centerY) * 0.01;
        // calculate new points
        for (var i = 0; i < formResolution; i++) {
          x[i] += random(-stepSize, stepSize);
          y[i] += random(-stepSize, stepSize);
        }
        stroke(primaryColor);
        noFill();

        // now, lets render the shape
        beginShape();
        // first controlpoint
        curveVertex(
          x[formResolution - 1] + centerX,
          y[formResolution - 1] + centerY
        );

        // only these points are drawn
        for (var i = 0; i < formResolution; i++) {
          curveVertex(x[i] + centerX, y[i] + centerY);
        }
        curveVertex(x[0] + centerX, y[0] + centerY);

        // end controlpoint
        curveVertex(x[1] + centerX, y[1] + centerY);
        endShape();
        break;
      }
    }
  } else {
    //     screensaver
    fill(backgroundColor);
    noStroke();
    rect(0, 0, width, height);

    for (var i = 0; i < particleCount; i++) {
      if (i > particleCount / 2) {
        stroke(primaryColor, particleAlpha);
      } else {
        stroke(tertiaryColor, particleAlpha);
      }
      particles[i].draw(
        strokeWidth, // + map(trebleEnergy, 80, 200, 0, 3),
        noiseScale,
        noiseStrength,
        noiseZVelocity
      );
    }
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(
        partA.position.x,
        partA.position.y,
        partB.position.x,
        partB.position.y
      );
    }
  }
}
