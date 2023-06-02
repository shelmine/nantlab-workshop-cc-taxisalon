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
let handX = 0;
let handY = 0;
let handDetected = false;

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
 let currentPattern = 1;
//let currentPattern = 1;

// pattern 2
let centerX;
let centerY;
var formResolution = 15;
var stepSize = 2;
var distortionFactor = 1;
var initRadius = 150;
var x = [];
var y = [];
let filled = false;

//pattern 3
var tileCount = 20;

var moduleColor;
var moduleAlpha = 180;
var maxDistance = 500;

//pattern 3
var tileCount = 20;
var actRandomSeed = 0;

var actStrokeCap;

var colorLeft;
var colorRight;
var alphaLeft = 255;
var alphaRight = 255;

//pattern 4
var count = 0;
var tileCountX = 30;
var tileCountY = 30;
var tileWidth = 0;
var tileHeight = 0;

var colorStep = 10;

var circleCount = 10;
var endSize = 0;
var endOffset = 0;

var actRandomSeed = 0;

//pattern 5
var count = 0;
var tileCountX = 6;
var tileCountY = 6;

var drawMode = 1;

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
setInterval(() => {
  let numberOfPatterns = 7;
  currentPattern = 
  Math.floor(Math.random()*numberOfPatterns);
 console.log("TODO: set pattern", currentPattern)
 }, 5000)

function keyPressed() {
  if (key == "k"){
    let numberOfPatterns = 7;
    currentPattern = 
    (currentPattern +1) %
    numberOfPatterns;
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
    handX = pose.rightWrist.x;
    handY = pose.rightWrist.y;
    handDetected = true;
  } else {
    pose = null;
    handDetected = false;
    
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

  //   lets assign colors here
  backgroundColor = color(0);
  primaryColor = color(highMidEnergy, lowMidEnergy, bassEnergy);
  secondaryColor = color(42, bassEnergy, trebleEnergy);
  tertiaryColor = color(bassEnergy, 196, trebleEnergy);
  quarternaryColor = color(244, 162, bassEnergy);
  quinaryColor = color(highMidEnergy, 111, bassEnergy);


  //   get skeleton positions
  if (pose) {
    noseX = pose.nose.x;
    noseY = pose.nose.y;
    leftHandY = pose.leftWrist.y;
    leftHandX = pose.leftWrist.x;
    rightHandY = pose.rightWrist.y;
    rightHandX = pose.rightWrist.x;
    rightHandX= width - pose.rightWrist.x;
    leftHandX= width - pose.leftWrist.x;
  }

  //   finally draw visuals
  if (pose && timestamp < poseTimestamp + 5000) {
    // if there is a pose, then draw one of the patterns
    switch (currentPattern) {
      //skeleton
      
      //drawing circles
      case 0: {
        if (newPersonDetected) {

          // clear background if there is a new person
        
          noStroke();
          fill(backgroundColor);
          rect(0, 0,width, height);
          
          
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
          x[formResolution - 1] + rightHandX,
          y[formResolution - 1] + rightHandY
        );

        // only these points are drawn
        for (var i = 0; i < formResolution; i++) {
          curveVertex(x[i] + rightHandX, y[i] + rightHandY);
        }
        curveVertex(x[0] + rightHandX, y[0] + rightHandY);

        // end controlpoint
        curveVertex(x[1] + rightHandX, y[1] + rightHandY);
        endShape();
        break;
      }
      case 1: {
    
        fill(backgroundColor);
        rect(0, 0, width, height);
        image(video, 0, 0, width, height);
        drawKeypoints();
        drawSkeleton();
        break;
      
    }
        case 2: {
           if (pose) {
           actStrokeCap = SQUAREs;
  colorLeft = primaryColor
  colorRight = tertiaryColor
              strokeCap(actStrokeCap);

  randomSeed(actRandomSeed);

  for (var gridY = 0; gridY < tileCount; gridY++) {
    for (var gridX = 0; gridX < tileCount; gridX++) {

      var posX = width / tileCount * gridX;
      var posY = height / tileCount * gridY;

      var toggle = int(random(0, 2));

      if (toggle == 0) {
        stroke(colorLeft);
        strokeWeight(rightHandX / 5);
        line(posX, posY, posX + width / tileCount, posY + height / tileCount);
      }
      if (toggle == 1) {
        stroke(colorRight);
        strokeWeight (rightHandY / 10);
        line(posX, posY + width / tileCount, posX + height / tileCount, posY);
}
        }          
          
        }
      }
      break;
}

//Kreise
       case 3: {
        if (pose) {
        createCanvas(1920, 1080);
  tileWidth = width / tileCountX / 1.5 ;
  tileHeight = height / tileCountY / 1.5;
  noFill();
  stroke(primaryColor, 128);
}

  background(255);
  randomSeed(actRandomSeed);

  translate(tileWidth / 2, tileHeight / 2);

  circleCount = rightHandX / 50 + 1;
  endSize = map(rightHandX, 0, max(width, rightHandX), tileWidth / 2, 0);
  endOffset = map(rightHandY, 0, max(height, rightHandY), 0, (tileWidth - endSize) / 2);

  for (var gridY = 0; gridY <= tileCountY; gridY++) {
    for (var gridX = 0; gridX <= tileCountX; gridX++) {
      push();
      translate(tileWidth * gridX, tileHeight * gridY);
      scale(1, tileHeight / tileWidth);

      var toggle = int(random(0, 4));
      if (toggle == 0) rotate(-HALF_PI);
      if (toggle == 1) rotate(0);
      if (toggle == 2) rotate(HALF_PI);
      if (toggle == 3) rotate(PI);

      // draw module
      for (var i = 0; i < circleCount; i++) {
        var diameter = map(i, 0, circleCount, tileWidth, endSize);
        var offset = map(i, 0, circleCount, 0, endOffset);
        ellipse(offset, 0, diameter, diameter);
      }
      pop();
    }
  }
  
}
break;


//Wellen
case 4: {
  if (pose)
rectMode(CENTER);
clear();
noFill();
stroke(primaryColor,secondaryColor,quinaryColor);
strokeWeight(1);

count = leftHandX / 10 + 10;
var para = leftHandY / height;

var tileWidth = width / tileCountX;
var tileHeight = height / tileCountY;

for (var gridY = 0; gridY <= tileCountY; gridY++) {
for (var gridX = 0; gridX <= tileCountX; gridX++) {

var posX = tileWidth * gridX + tileWidth / 2;
var posY = tileHeight * gridY + tileHeight / 2;

push();
translate(posX, posY);

// switch between modules
switch (drawMode) {
case 1:
 stroke(primaryColor,secondaryColor,quinaryColor);
  for (var i = 0; i < count; i++) {
    rect(0, 0, tileWidth, tileHeight);
    scale(1 - 3 / count);
    rotate(para * 0.1);
  }
  break;
case 2:
  stroke(primaryColor,secondaryColor,quinaryColor);
  for (var i = 0; i < count; i++) {
    var gradient = lerpColor(color(0, 0), color(166, 141, 5), i / count);
    fill(gradient, i / count * 200);
    rotate(QUARTER_PI);
    rect(0, 0, tileWidth, tileHeight);
    scale(1 - 3 / count);
    rotate(para * 1.5);
  }
  break;
case 3:
  stroke(primaryColor,secondaryColor,0);
  for (var i = 0; i < count; i++) {
    var gradient = lerpColor(color(0, 130, 164), color(255), i / count);
    fill(gradient, 170);

    push();
    translate(4 * i, 0);
    ellipse(0, 0, tileWidth / 4, tileHeight / 4);
    pop();

    push();
    translate(-4 * i, 0);
    ellipse(0, 0, tileWidth / 4, tileHeight / 4);
    pop();

    scale(1 - 1.5 / count);
    rotate(para * 1.5);
  }
  break;
}

pop();

}
}
break;

}



//rectangles
case 5: {
  if(pose)
  noStroke();
  translate(x, height*3);
  rectMode(CENTER);
   background();
  if (handDetected) {
    let r2 = map(rightHandX, 0, width, 0, height);
    let r1 = height - r2*2;

    fill(237, 34, 93, r1);
    rect(width / 2 + r1 / 2, height / 2, r1, r1);

    fill(237, 34, 93, r2);
    rect(width / 2 - r2 / 2, height / 2, r2, r2);
    break;
  }
}


}


    
  } else {
    //     screensaver
    fill(backgroundColor);
    noStroke();
    rect(0, 0, 1920, 1080);

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
