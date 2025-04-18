((root) => {
  var FrameTest = root.FrameTest = (root.FrameTest || {});

  var Frame = FrameTest.Frame;

  const canvasHeight = 1080;
  const canvasWidth = 1920;

  class Display {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.frameWidth = canvasWidth;
      this.frameHeight = canvasHeight;
      this.centerX = Math.floor(canvasWidth / 2);
      this.centerY = Math.floor(canvasHeight / 2);
      this.frameRate = 30;

      this.bgColor = "black";
      this.fgColor = "white";

      this.mouseXY = [0, 0];

      this.theta = Math.tanh(this.frameWidth / this.frameHeight);
      this.shrinkFactor   = 0.975;
      this.deltaTheta     = 0;
      this.depth          = 30;
      this.idleDelta      = 2;
      this.idleInc        = 0.0003;
      this.shrinkInc      = 0.0001;
      this.minShrinkRate  = 0.8;
      this.shrinkDelta    = 0.3;
      this.huePeriod      = 0;

      this.dPointPosition = 1;

      this.holding         = false;
      this.clearBackground = false;
      this.useHueConfig    = false;
      this.useInvert       = false;
      this.useSigmoid      = false;
      this.modifyHsv       = false;

      // Config options

      this.configOptions = { "huePeriod": true };

      let optionInputs = Array.from(document.getElementsByClassName("configOption"));
      this.optionNames = optionInputs.map((opt) => opt.id);

      optionInputs.forEach((optInput) => {
        
        optInput.addEventListener("click", () => {
          this.optionNames.forEach((optName) => { this.configOptions[optName] = false})
          this.configOptions[optInput.id] = optInput.checked;
        });
      });

      const clearConfig = document.getElementById("clearBackground");
      if (clearConfig) {
        clearConfig.addEventListener("click", () => {
          this.clearBackground = clearConfig.checked;
        })
      }

      const invertConfig = document.getElementById("invert");
      if (invertConfig) {
        invertConfig.addEventListener("click", () => {
          this.useInvert = invertConfig.checked;
        })
      }

      const sigmoidConfig = document.getElementById("sigmoid");
      if (sigmoidConfig) {
        sigmoidConfig.addEventListener("click", () => {
          this.useSigmoid = sigmoidConfig.checked;
        })
      }

      const modifyHsvConfig = document.getElementById("modifyHsv");
      if (modifyHsvConfig) {
        modifyHsvConfig.addEventListener("click", () => {
          this.modifyHsv = modifyHsvConfig.checked;
        })
      }
      
      this.canvas.addEventListener('mousedown', () => {
        this.holding = true;
      })

      this.canvas.addEventListener('mousemove', (e) => {

        if (this.holding) {
          this.mouseXY = [
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
          ];
        }

      })

      this.canvas.addEventListener('mouseup', () => {
        this.holding = false;
      })

      let radius = Math.hypot(this.frameWidth / 2, this.frameHeight / 2)

      this.frame = new Frame(
        this.canvas,
        [this.centerX, this.centerY],        // center
        this.frameWidth,           // width
        this.frameHeight,          // height
        radius,                    // radius
        this.theta,                // theta
        () => this.deltaTheta,     // deltaTheta
        () => this.shrinkFactor,   // reductionRate
        () => this.depth,          // depth
        () => this.huePeriod,      // period
        () => this.dPointPosition, // Point D position
        () => this.useInvert,      // use invert value
        () => this.useSigmoid,     // use sigmoid hue
        () => this.modifyHsv )     // modify hsv function

      this.reset();
    }

    reset() {

      window.clearInterval(this.endID);
    }

    draw() {

      if (this.idleDelta > (10 * Math.PI)) {
        this.idleDelta = 0;
      }
      this.idleDelta += this.idleInc;

      // Fill background
      if (this.clearBackground) {
        this.ctx.clearRect(0, 0, this.frameWidth, this.frameHeight);
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.frameWidth, this.frameHeight);
      }

      if (this.holding) {
        let diagonal = Math.hypot(this.frameWidth / 2, this.frameWidth / 2);
        let x = this.centerX - this.mouseXY[0];
        let y = this.centerY - this.mouseXY[1];
        let distRatio = Math.hypot(x, y) / diagonal;

        this.shrinkFactor = this.minShrinkRate + this.shrinkDelta * distRatio;
        this.deltaTheta = this.idleDelta / 2;
      }

      else {
        this.deltaTheta = this.idleDelta;

        if (this.shrinkFactor >= 1 && this.shrinkInc < 0 ||
            this.shrinkFactor <= this.minShrinkRate && this.shrinkInc > 0) {

          this.shrinkInc = this.shrinkInc * -1
        }
        this.shrinkFactor -= this.shrinkInc;
      }

      this.frame.draw();
    }


    start() {

      this.windowID = window.setInterval(this.step.bind(this), this.frameRate);
    }
    
    
    step() {
      
      this.draw();
    }
  }

  FrameTest.Display = Display;
  
  var canvas = document.getElementsByTagName("canvas")[0];
  new FrameTest.Display(canvas).start();

})(this);