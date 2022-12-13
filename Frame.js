class Drawer {
  constructor(
    canvas,
    config = { lineWidth: 1, strokeStyle: "black", lineCap: "round" }
  ) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.isDrawing = false;
    this.hue = 0;
    this.direction = true;
    this.lineWidth = config.lineWidth;
    this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
    this.canvas.addEventListener("mousemove", this.drawLine.bind(this));
    this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
    this.canvas.addEventListener("mouseout", this.stopDrawing.bind(this));
  }

  startDrawing(e) {
    this.isDrawing = true;
    this.context.beginPath();
    this.context.moveTo(e.offsetX, e.offsetY);
  }

  drawLine(e) {
    if (!this.isDrawing) return;
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
    this.context.lineTo(e.offsetX, e.offsetY);
    this.context.stroke();
    this.context.beginPath();
    this.context.moveTo(e.offsetX, e.offsetY);
    this.hue++;
    if (this.hue >= 360) {
      this.hue = 0;
    }
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  set lineWidth(lineWidth) {
    this.lineWidth = lineWidth;
  }

  get lineWidth() {
    return this.lineWidth;
  }

  set strokeStyle(strokeStyle) {
    this.strokeStyle = strokeStyle;
  }

  get strokeStyle() {
    return this.strokeStyle;
  }
}

class TimeLine extends Drawer {
  constructor() {
    this.frames = [];
    this.finalTimeStamp = 0;
  }

  get findFramebyId() {
    return this.frames.find((f) => f.id === id);
  }

  set updateFrame(frame) {
    this.frames = this.frames.map((f) => (f.id === frame.id ? frame : f));
  }

  addFrame(frame) {
    this.frames.push(frame);
    this.finalTimeStamp += frame.ms;
  }

  removeFrame(frame) {
    this.frames = this.frames.filter((f) => f.id !== frame.id);
  }
}

class Frame extends TimeLine {
  constructor(ms) {
    this.ms = ms;
    this.id = uuidv4();
    this.image = new Image();
    _frames.push(this);
  }

  get frames() {
    return _frames;
  }

  set frames(frames) {
    _frames = frames;
  }

  display() {
    this.image.src = super.canvas.toDataURL();
    this.image.style = "width: 100%; height: 100%;";
    this.image.id = this.id;
    this.image.classList.add("frame");
    this.image.addEventListener("click", this.selectFrame.bind(this));
    this.image.addEventListener("dblclick", this.removeFrame.bind(this));
    document.getElementById("frames").appendChild(this.image);
  }

  selectFrame() {
    this.frames.forEach((f) => {
      document.getElementById(f.id).classList.remove("selected");
    });
    document.getElementById(this.id).classList.add("selected");
  }

  removeFrame() {
    this.frames = this.frames.filter((f) => f.id !== this.id);
    document
      .getElementById("frames")
      .removeChild(document.getElementById(this.id));
  }

  get ms() {
    return _ms;
  }

  set ms(ms) {
    _ms = ms;
  }

  
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
