class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 1.5) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.useBrain = controlType == "AI";

    if (controlType != "dummy") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }
    this.controls = new Controls(controlType);

    this.speed = 0;
    this.acceleration = 0.2;
    this.friction = 0.05;
    this.maxSpeed = maxSpeed;

    this.angle = 0;

    this.damaged = false;
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map(s => s == null ? 0 : 1 - s.offset)
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);
      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
  }

  #createPolygon(){
    const points = [];

    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);

    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad
    });
    points.push({
      x: this.x-Math.sin(Math.PI + this.angle-alpha) * rad,
      y: this.y-Math.cos(Math.PI + this.angle-alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
    });
    return points;
  }

  #move() {
    // On Clicking "ArrowUp"
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }

    // On Clicking "ArrowDown"
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    // if The car's speed increased more than its actual max speed this assign it to this maximum
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    // Lowering the speed in pressing "ArrowDown"
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2
    }

    // Adding some friction to the car - "ArrowUp" pressed
    if (this.speed > 0) {
      this.speed -= this.friction;
    }

    // Adding some friction to the car - "ArrowDown" pressed
    if (this.speed < 0) {
      this.speed += this.friction;
    }

    // Stop the car from moving
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;

      // "ArrowLeft" pressed action
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }

      // "ArrowRight" pressed action
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  draw(ctx, color, drawSensors = false) {
    if (this.damaged) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();
    if (this.sensor && drawSensors) {
      this.sensor.draw(ctx);
    }
  }
}

function polysIntersect(p1, p2) {
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      const touch = getIntersection(
        p1[i],
        p1[(i + 1) % p1.length],
        p2[j],
        p2[(j+1) % p2.length]
      );
      if (touch) {
        return true;
      }
    }
  }
  return false;
}