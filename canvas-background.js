// create an IIFE
(() => {
  const canvas = document.getElementById('canvas-background');
  // get the rendering context for the canvas
  const context = canvas.getContext('2d');

  const width = window.innerWidth;
  const height = window.innerHeight;

  const numOfStars = 50;
  // helper function for generating random numbers between two values
  const random = (min, max) => Math.random() * (max - min) + min;

  // Set background to be fullscreen
  canvas.width = width;
  canvas.height = height;

  const drawBackground = () => {
    // The inner circle is at x=0, y=0, with radius=height
    // The outer circle is at x=0, y=0, with radius=width
    const gradient = context.createRadialGradient(0, 0, height, 0, 0, width);
    // offset and color
    gradient.addColorStop(0, '#002D62');
    gradient.addColorStop(0.5, '#0066b2');
    gradient.addColorStop(1, '#6699CC');

    // make canvas the color of gradient
    context.fillStyle = gradient;
    // place its top-left corner at (0, 0), and
    // and give it a size of "width" wide by "height" tall.
    context.fillRect(0, 0, width, height);
  };

  const drawForeground = () => {
    context.fillStyle = '#13274F';
    context.fillRect(0, height * 0.95, width, height);

    context.fillStyle = '#002D62';
    context.fillRect(0, height * 0.955, width, height);
  };

  const drawSanta = () => {
    const image = new Image();
    image.src = './assets/santa.png';

    // Draw when image has loaded
    image.onload = function () {
      /**
       * this - references the image object
       * draw at 95% of the width of the canvas - the width of the image
       * draw at 95,5% of the height of the canvas - the height of the image
       */
      context.drawImage(
        this,
        width * 0.95 - this.width,
        height * 0.955 - this.height
      );
    };
  };

  const drawStars = () => {
    let countOfStars = numOfStars;

    context.fillStyle = '#E6E6FA';

    while (countOfStars--) {
      const x = random(25, width - 50);
      const y = random(25, height * 0.5);
      const size = random(1, 4);

      context.fillRect(x, y, size, size);
    }
  };

  drawBackground();
  drawForeground();
  drawSanta();
  drawStars();
})();
