(() => {
  const canvas = document.getElementById('fireworks');
  const context = canvas.getContext('2d');

  const width = window.innerWidth;
  const height = window.innerHeight;

  const positions = {
    mouseX: 0,
    mouseY: 0,
    wandX: 0,
    wandY: 0,
  };

  const fireworks = [];
  const flecks = [];
  const numberOfFlecks = 50; //  bear in mind: performance gets worse with higher number of flecks

  const random = (min, max) => Math.random() * (max - min) + min;

  const getDistance = (x1, y1, x2, y2) => {
    const xDistance = x1 - x2;
    const yDistance = y1 - y2;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  };

  let mouseClicked = false;
  let mouseEnter = false;

  const image = new Image();

  canvas.width = width;
  canvas.height = height;

  image.src = './assets/celebrate.png';

  // helper function for removing text on mouse leave
  function clear() {
    context.clearRect(0, 0, width, height);
  }

  function write() {
    context.font = '30px Roboto';
    context.fillStyle = '#FEBE10';
    context.fillText('Ho Ho Ho!', width / 2, 90);
  }

  function drawText() {
    write();
    setTimeout(function () {
      clear();
    }, 1000);
  }

  const drawWand = () => {
    // get the position for the wand on the canvas
    positions.wandX = width * 0.955 - image.width;
    positions.wandY = height * 0.975 - image.height;

    const rotationInRadians =
      Math.atan2(
        positions.mouseY - positions.wandY,
        positions.mouseX - positions.wandX
      ) - Math.PI;
    const rotationInDegrees = (rotationInRadians * 180) / Math.PI + 360;

    context.clearRect(0, 0, width, height);

    // save context to remove transformation afterwards
    context.save();
    context.translate(positions.wandX, positions.wandY);

    if (rotationInDegrees > 0 && rotationInDegrees < 90) {
      context.rotate((rotationInDegrees * Math.PI) / 180); // need to convert back to radians
    } else if (rotationInDegrees > 90 && rotationInDegrees < 275) {
      context.rotate((90 * Math.PI) / 180); // cap rotation at 90° if it the cursor goes beyond 90°
    }

    context.drawImage(image, -image.width, -image.height / 2); // need to position anchor to right-middle part of the image

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
    canvas.addEventListener('mouseenter', () => (mouseEnter = true));
    canvas.addEventListener('mouseleave', () => (mouseEnter = false));
  };

  // call the loop function indefinitely and redraw the screen every frame
  const loop = () => {
    requestAnimationFrame(loop);
    drawWand();

    if (mouseEnter) {
      drawText();
    }

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
  };

  image.onload = () => {
    attachEventListeners();
    loop();
  };

  class Firework {
    constructor() {
      const init = () => {
        let fireworkLength = 8;

        this.x = positions.wandX - 30;
        this.y = positions.wandY - 50;
        this.tx = positions.mouseX;
        this.ty = positions.mouseY;

        this.distanceToTarget = getDistance(
          positions.wandX,
          positions.wandY,
          this.tx,
          this.ty
        );
        this.distanceTraveled = 0;

        this.coordinates = [];
        this.angle = Math.atan2(
          this.ty - positions.wandY,
          this.tx - positions.wandX
        );
        this.speed = 20;
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
          positions.wandX,
          positions.wandY,
          this.x + vx,
          this.y + vy
        );

        if (this.distanceTraveled >= this.distanceToTarget) {
          let i = numberOfFlecks;

          while (i--) {
            flecks.push(new Fleck(this.tx, this.ty));
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

        context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
        context.stroke();

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
