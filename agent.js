var Particle = function (noiseZRange) {
  this.vector = createVector(random(width), random(height));
  this.vectorOld = this.vector.copy();
  this.stepSize = random(1, 5);
  this.angle;
  this.noiseZ = random(noiseZRange);
};

Particle.prototype.draw2 = function (strokeWidth, noiseZVelocity) {
  this.vector.x += cos(this.angle) * this.stepSize;
  this.vector.y += sin(this.angle) * this.stepSize;

  if (this.vector.x < -10) this.vector.x = this.vectorOld.x = width + 10;
  if (this.vector.x > width + 10) this.vector.x = this.vectorOld.x = -10;
  if (this.vector.y < -10) this.vector.y = this.vectorOld.y = height + 10;
  if (this.vector.y > height + 10) this.vector.y = this.vectorOld.y = -10;

  strokeWeight(strokeWidth * this.stepSize);
  line(this.vectorOld.x, this.vectorOld.y, this.vector.x, this.vector.y);

  this.vectorOld = this.vector.copy();

  this.noiseZ += noiseZVelocity;
};

Particle.prototype.draw = function (
  strokeWidth,
  noiseScale,
  noiseStrength,
  noiseZVelocity
) {
  this.angle =
    noise(this.vector.x / noiseScale, this.vector.y / noiseScale, this.noiseZ) *
    noiseStrength;

  this.draw2(strokeWidth, noiseZVelocity);
};
