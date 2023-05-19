// camera input and skeleton tracking
let video;
let poseNet;
let pose;
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
let currentPattern = 0;

// scene 1
var lineLength = 100;
var angle = 0;
var angleSpeed = 1;

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
}
function mousePressed() {}
function mousePressed() {
  if (key == "s" || key == "S") {
    saveCanvas(getTimestamp(), "png");
  }
}

function gotPoses(poses) {
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
      case 0: {
        if (newPersonDetected) {
          // clear background if there is a new person
          fill(backgroundColor);
          noStroke();
          rect(0, 0, width, height);
        }
        angleSpeed = map(height - leftHandY, 0, height, 1, 10);
        lineLength = map(leftHandX, 0, width, 20, 200);
        push();
        translate(rightHandX, leftHandX);
        rotate(radians(angle));
        stroke(primaryColor);
        line(0, 0, lineLength, 0);
        pop();

        angle += angleSpeed;
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
