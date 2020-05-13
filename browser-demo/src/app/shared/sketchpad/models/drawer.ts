import { centerImage, getBoundingRectangle, imageDataToGrayscale } from '../utils';

export class Drawer {
  canvas = null;
  context = null;
  canvasOffset = null;
  thumbnailCtx = null;

  isRecognized = false;
  isDrawing = false;
  zoom = 10;
  footprint = {
    width: 28,
    height: 28
  };

  constructor(sketchpad: HTMLCanvasElement, thumbnail: HTMLCanvasElement) {
    this.canvas = sketchpad;
    this.context = this.canvas.getContext("2d");
    this.canvasOffset = this.getOffsetSum(this.canvas);
    this.thumbnailCtx = thumbnail.getContext("2d");
    this.init();
  }

  clear() {
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.footprint.width * this.zoom, this.footprint.height * this.zoom);

    this.thumbnailCtx.fillStyle = "white";
    this.thumbnailCtx.fillRect(0, 0, this.footprint.width, this.footprint.height);
    this.isRecognized = false;
  }

  init() {
    const touchAvailable = ("createTouch" in document) || ("ontouchstart" in window);

    // attach the touchstart, touchmove, touchend event listeners.
    if (touchAvailable) {
      this.canvas.addEventListener("touchstart", this.draw.bind(this), false);
      this.canvas.addEventListener("touchmove", this.draw.bind(this), false);
      this.canvas.addEventListener("touchend", this.draw.bind(this), false);
    } else { // attach the mousedown, mousemove, mouseup event listeners.
      this.canvas.addEventListener("mousedown", this.draw.bind(this), false);
      this.canvas.addEventListener("mousemove", this.draw.bind(this), false);
      this.canvas.addEventListener("mouseup", this.draw.bind(this), false);
    }

    window.addEventListener("resize", (event) => {
      event.preventDefault();
      this.canvasOffset = this.getOffsetSum(this.canvas);
    }, false);

    // prevent elastic scrolling
    document.body.addEventListener("touchmove", (event) => {
      event.preventDefault();
    }, false); // end body.onTouchMove
  }

  getOffsetSum(elem) {
    let top = 0;
    let left = 0;
    let _elem = elem;

    while (_elem) {
      top = top + parseInt(_elem.offsetTop, 10);
      left = left + parseInt(_elem.offsetLeft, 10);
      _elem = _elem.offsetParent;
    }

    return { top, left };
  }

  touchstart(coors) {
    this.context.beginPath();
    this.context.lineWidth = 20;
    this.context.lineCap="round";
    this.context.moveTo(coors.x - this.canvasOffset.left, coors.y - this.canvasOffset.top);
    this.isDrawing = true;
  }

  touchmove(coors) {
    if (this.isDrawing) {
      if (this.isRecognized) {
        this.clear();
      }

      this.context.lineTo(coors.x - this.canvasOffset.left, coors.y - this.canvasOffset.top);
      this.context.stroke();
    }
  }

  touchend(coors) {
    if (this.isDrawing) {
      this.touchmove(coors);
      this.isDrawing = false;
    }
  }

  draw(event) {
    let type = null;
    // map mouse events to touch events
    switch (event.type) {
      case "mousedown":
        event.touches = [];
        event.touches[0] = {
          pageX: event.pageX,
          pageY: event.pageY
        };
        type = "touchstart";
        break;
      case "mousemove":
        event.touches = [];
        event.touches[0] = {
          pageX: event.pageX,
          pageY: event.pageY
        };
        type = "touchmove";
        break;
      case "mouseup":
        event.touches = [];
        event.touches[0] = {
          pageX: event.pageX,
          pageY: event.pageY
        };
        type = "touchend";
        break;
    }

    // touchend clear the touches[0], so we need to use changedTouches[0]
    let coors;
    if (event.type === "touchend") {
      coors = {
        x: event.changedTouches[0].pageX,
        y: event.changedTouches[0].pageY
      };
    } else {
      // get the touch coordinates
      coors = {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
      };
    }
    type = type || event.type;
    // pass the coordinates to the appropriate handler
    this[type](coors);
  }

  recognize(event) {
    event.preventDefault();
    if (this.isRecognized) {
      return;
    }

    let imgData = this.context.getImageData(0, 0, 280, 280);
    let grayscaleImg = imageDataToGrayscale(imgData);
    const boundingRectangle = getBoundingRectangle(grayscaleImg, 0.01);
    const trans = centerImage(grayscaleImg); // [dX, dY] to center of mass

    // copy image to hidden canvas, translate to center-of-mass, then
    // scale to fit into a 200x200 box (see MNIST calibration notes on
    // Yann LeCun's website)
    const canvasCopy = document.createElement("canvas");
    canvasCopy.width = imgData.width;
    canvasCopy.height = imgData.height;
    const copyCtx = canvasCopy.getContext("2d");
    const brW = boundingRectangle.maxX+1-boundingRectangle.minX;
    const brH = boundingRectangle.maxY+1-boundingRectangle.minY;
    const scaling = 190 / (brW>brH?brW:brH);
    // scale
    copyCtx.translate(this.canvas.width/2, this.canvas.height/2);
    copyCtx.scale(scaling, scaling);
    copyCtx.translate(-this.canvas.width/2, -this.canvas.height/2);
    // translate to center of mass
    copyCtx.translate(trans.transX, trans.transY);

    copyCtx.drawImage(this.context.canvas, 0, 0);

    // now bin image into 10x10 blocks (giving a 28x28 image)
    imgData = copyCtx.getImageData(0, 0, 280, 280);
    grayscaleImg = imageDataToGrayscale(imgData);
    console.log(grayscaleImg);

    const nnInput = new Array(784);
    const nnInput2 = [];

    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        let mean = 0;

        for (let v = 0; v < 10; v++) {
          for (let h = 0; h < 10; h++) {
            mean += grayscaleImg[(y * 10) + v][(x * 10) + h];
          }
        }

        mean = (1 - (mean / 100)); // average and invert
        nnInput[(x * 28) + y] = (mean - 0.5) / 0.5;
      }
    }

    const thumbnail = this.thumbnailCtx.getImageData(0, 0, this.footprint.width, this.footprint.height);


    // for visualization/debugging: paint the input to the neural net.
    // if (document.getElementById('preprocessing').checked == true) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(copyCtx.canvas, 0, 0);

    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const block = this.context.getImageData(x * 10, y * 10, 10, 10);
        const newVal = 255 * (0.5 - (nnInput[(x * 28) + y] / 2));
        nnInput2.push(Math.round((255-newVal)/255*100)/100);
        for (let i = 0; i < 4 * 10 * 10; i+=4) {
          block.data[i] = newVal;
          block.data[i+1] = newVal;
          block.data[i+2] = newVal;
          block.data[i+3] = 255;
        }
        this.context.putImageData(block, x * 10, y * 10);

        thumbnail.data[((y * 28) + x) * 4] = newVal;
        thumbnail.data[(((y * 28) + x) * 4) + 1] = newVal;
        thumbnail.data[(((y * 28) + x) * 4) + 2] = newVal;
        thumbnail.data[(((y * 28) + x) * 4) + 3] = 255;
      }
    }

    this.thumbnailCtx.putImageData(thumbnail, 0, 0);

    // //console.log(nnInput2);
    // var output = window["nn"](nnInput2);
    // //console.log(output);
    // maxIndex = 0;
    // output.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});
    // console.log('Detect1: '+maxIndex);
    // document.getElementById('result').innerText = maxIndex.toString();
    this.isRecognized = true;

    return nnInput2;
  }
}
