(() => {
  const canvas = document.getElementById('canvas-fireworks'); // gets a reference to the HTML <canvas> element
  const context = canvas.getContext('2d'); // get the rendering context for the canvas

  // get document's width and height
  const width = window.innerWidth;
  const height = window.innerHeight;

  // set background to be fullscreen
  canvas.width = width;
  canvas.height = height;

  const positions = {
    mouseX: 0,
    mouseY: 0,
    popperX: 0,
    popperY: 0,
  };

  const fireworks = [];
  const flecks = [];
  const flecks2 = [];
  const flecks3 = [];
  const numberOfFlecks = 25; //  bear in mind: performance gets worse with higher number of flecks

  const random = (min, max) => Math.random() * (max - min) + min;

  // calculate the distance between two points
  // using Pythagorean theorem
  // d = √x² + y², where x = x1 - x2, and y = y1 - y2
  const getDistance = (x1, y1, x2, y2) => {
    const xDistance = x1 - x2;
    const yDistance = y1 - y2;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  };

  let mouseClicked = false;

  const popperImage = new Image();

  popperImage.src = './assets/popper.png';

  const drawPopper = () => {
    // get the position for the popper on the canvas
    positions.popperX = width * 0.51;
    positions.popperY = height * 0.95 - popperImage.height;

    const rotationInRadians =
      Math.atan2(
        positions.mouseY - positions.popperY,
        positions.mouseX - positions.popperX
      ) - Math.PI;

    const rotationInDegrees = (rotationInRadians * 180) / Math.PI + 360;

    context.clearRect(0, 0, width, height);

    // save context to remove transformation afterwards
    context.save();
    context.translate(positions.popperX, positions.popperY);

    if (rotationInDegrees > 0 && rotationInDegrees < 90) {
      context.rotate((rotationInDegrees * Math.PI) / 180); // need to convert back to radians
    } else if (rotationInDegrees > 90 && rotationInDegrees < 275) {
      context.rotate((90 * Math.PI) / 180); // cap rotation at 90° if it the cursor goes beyond 90°
    }

    context.drawImage(popperImage, -popperImage.width, -popperImage.height / 2); // need to position anchor to right-middle part of the popperImage

    context.restore();
  };

  // listen to the mousemove event and
  // set the mouse positions to the correct coordinates
  const attachEventListeners = () => {
    canvas.addEventListener('mousemove', (e) => {
      positions.mouseX = e.pageX;
      positions.mouseY = e.pageY;
    });

    canvas.addEventListener('mousedown', () => (mouseClicked = true));
    canvas.addEventListener('mouseup', () => (mouseClicked = false));
  };

  // call the loop function indefinitely and redraw the screen every frame
  const loop = () => {
    requestAnimationFrame(loop);
    drawPopper();
    if (mouseClicked) {
      fireworks.push(new Firework());
    }

    let fireworkIndex = fireworks.length;
    while (fireworkIndex--) {
      fireworks[fireworkIndex].draw(fireworkIndex);
    }

    let fleckIndex = flecks.length;
    while (fleckIndex--) {
      flecks[fleckIndex].draw(fleckIndex);
    }

    let fleckIndex2 = flecks2.length;
    while (fleckIndex2--) {
      flecks2[fleckIndex2].draw(fleckIndex2);
    }

    let fleckIndex3 = flecks3.length;
    while (fleckIndex3--) {
      flecks3[fleckIndex3].draw(fleckIndex3);
    }
  };

  popperImage.onload = () => {
    attachEventListeners();
    loop();
  };

  class Firework {
    constructor() {
      const init = () => {
        let fireworkLength = 8;

        // current coordinates
        this.x = positions.popperX;
        this.y = positions.popperY;

        // target coordinates
        this.target_x = positions.mouseX;
        this.target_y = positions.mouseY;

        // distance from starting point to target
        this.distanceToTarget = getDistance(
          this.x,
          this.y,
          this.target_x,
          this.target_y
        );
        this.distanceTraveled = 0;

        this.coordinates = [];
        this.angle = Math.atan2(
          this.target_y - positions.popperY,
          this.target_x - positions.popperX
        );
        this.speed = 40;
        this.friction = 0.99;
        this.hue = random(0, 360);

        while (fireworkLength--) {
          this.coordinates.push([this.x, this.y]);
        }
      };

      this.animate = (index) => {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.friction;

        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = getDistance(
          positions.popperX,
          positions.popperY,
          this.x + vx,
          this.y + vy
        );

        if (this.distanceTraveled >= this.distanceToTarget) {
          let i = numberOfFlecks;

          while (i--) {
            flecks.push(new Fleck(this.target_x, this.target_y));
            flecks2.push(new Fleck(this.target_x + 50, this.target_y - 50));
            flecks3.push(new Fleck(this.target_x - 100, this.target_y - 100));
          }

          fireworks.splice(index, 1);
        } else {
          this.x += vx;
          this.y += vy;
        }
      };

      this.draw = (index) => {
        context.beginPath();
        context.moveTo(
          this.coordinates[this.coordinates.length - 1][0],
          this.coordinates[this.coordinates.length - 1][1]
        );
        context.lineTo(this.x, this.y);

        this.animate(index);
      };

      init();
    }
  }

  class Fleck {
    constructor(x, y) {
      const init = () => {
        let fleckLength = 7;

        this.x = x;
        this.y = y;

        this.coordinates = [];

        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);

        this.friction = 0.95;
        this.gravity = 2;

        this.hue = random(0, 360);
        this.alpha = 1;
        this.decay = random(0.015, 0.03);

        while (fleckLength--) {
          this.coordinates.push([this.x, this.y]);
        }
      };

      this.animate = (index) => {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;

        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
          flecks.splice(index, 1);
          flecks2.splice(index, 1);
          flecks3.splice(index, 1);
        }
      };

      this.draw = (index) => {
        context.beginPath();
        context.moveTo(
          this.coordinates[this.coordinates.length - 1][0],
          this.coordinates[this.coordinates.length - 1][1]
        );
        context.lineTo(this.x, this.y);

        context.strokeStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
        context.stroke();

        this.animate(index);
      };

      init();
    }
  }
})();
