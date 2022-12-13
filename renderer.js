document.addEventListener("DOMContentLoaded", function () {
  var looping = false;
  var erasing = false;
  var currentlyEditing = "";
  const savedCanvas = document.getElementById("saved-frame");
  const savedCanvascontext = savedCanvas.getContext("2d");

  let restore_array = [];

  const cursor = document.getElementById("cursor");

  document.getElementById("loop").addEventListener("click", function () {
    this.classList.toggle("active");
    looping = !looping;
  });

  document
    .getElementsByClassName("space-bar")[0]
    .addEventListener("click", function () {
      keyisDown({ keyCode: 32 });
    });

  document
    .getElementsByClassName("f6")[0]
    .addEventListener("click", function () {
      keyisDown({ keyCode: 117 });
    });

  document.getElementById("ctrl-z").addEventListener("click", function () {
    keyisDown({ keyCode: 90, ctrlKey: true });
  });

  document.getElementById("eraser").addEventListener("click", function () {
    this.classList.toggle("active");
    erasing = !erasing;
  });

  const paintCanvas = document.querySelector("#frame");

  paintCanvas.width = window.innerWidth;
  paintCanvas.height = window.innerHeight;

  paintCanvas.onmousemove = function (e) {
    var event = e || window.event;
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
    cursor.style.left = window.mouseX + "px";
    cursor.style.top = window.mouseY + "px";
  };

  paintCanvas.onmouseleave = function (e) {
    document.documentElement.style.setProperty("--radius-cursor", 0 + "px");
  };

  paintCanvas.onmouseenter = function (e) {
    document.documentElement.style.setProperty("--radius-cursor", 15 + "px");
  };

  //for mobile device
  paintCanvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    paintCanvas.dispatchEvent(mouseEvent);
  });

  paintCanvas.addEventListener("touchstart", function (e) {
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    paintCanvas.dispatchEvent(mouseEvent);
  });

  paintCanvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    paintCanvas.dispatchEvent(mouseEvent);
  });

  //resize canvas on window resize
  window.addEventListener("resize", function () {
    paintCanvas.width = window.innerWidth;
    paintCanvas.height = window.innerHeight;
    drawSavedImages(paintCanvas, 0, 0);
  });

  const context = paintCanvas.getContext("2d");

  context.lineCap = "round";
  context.lineWidth = 15;

  const colorPicker = document.querySelector(".js-color-picker");

  colorPicker.addEventListener("change", (event) => {
    context.strokeStyle = event.target.value;
    document.documentElement.style.setProperty(
      "--color-cursor",
      `${context.strokeStyle}`
    );
  });

  const lineWidthRange = document.querySelector(".js-line-range");
  const lineWidthLabel = document.querySelector(".js-range-value");

  lineWidthRange.addEventListener("input", (event) => {
    const width = event.target.value;
    context.lineWidth = width;
    document.documentElement.style.setProperty(
      "--radius-cursor",
      context.lineWidth + "px"
    );
  });

  let x = 0,
    y = 0;
  let isMouseDown = false;

  const stopDrawing = () => {
    isMouseDown = false;

    if (restore_array.length > 25) {
      console.log(true);
      restore_array = restore_array.splice(-25, 25);
    }

    restore_array.push(
      context.getImageData(0, 0, paintCanvas.width, paintCanvas.height)
    );
  };

  const startDrawing = (event) => {
    isMouseDown = true;
    [x, y] = [event.offsetX, event.offsetY];
  };

  const drawLine = (event) => {
    if (isMouseDown) {
      const newX = event.offsetX;
      const newY = event.offsetY;
      context.beginPath();
      if (erasing == true) {
        context.globalCompositeOperation = "destination-out";
      } else {
        context.globalCompositeOperation = "source-over";
      }
      context.moveTo(x, y);
      context.lineTo(newX, newY);
      context.stroke();
      //[x, y] = [newX, newY];
      x = newX;
      y = newY;
    }
  };

  paintCanvas.addEventListener("mousedown", startDrawing);
  paintCanvas.addEventListener("mousemove", drawLine);
  paintCanvas.addEventListener("mouseup", stopDrawing);
  paintCanvas.addEventListener("mouseout", stopDrawing);

  //Save draw inside timeline
  const timeline = document.querySelector(".js-timeline");

  const saveDraw = () => {
    erasing = false;
    document.getElementById("eraser").classList.remove("active");

    if (currentlyEditing == "") {
      const image = paintCanvas.toDataURL();

      NewFrame(image, "new");

      const frames = document.querySelectorAll(".frame");

      drawSavedImages(paintCanvas);
      clearCanvas();
    } else {
      const image = paintCanvas.toDataURL();
      const frame = document.getElementById(currentlyEditing);
      const img = frame.children[1];

      img.src = image;
      drawSavedImages(paintCanvas);
      clearCanvas();
      currentlyEditing = "";
    }
  };

  function NewFrame(image, type = "new") {
    if (type == "new") {
      const img = document.createElement("img");
      img.src = image;

      const frame = document.createElement("div");
      frame.classList.add("frame");
      frame.id = uuidv4();

      const icon = document.createElement("i");

      icon.addEventListener("click", function () {
        frame.remove();
        currentlyEditing = "";
      });

      icon.classList.add("fas", "fa-trash-alt");
      frame.appendChild(icon);
      frame.appendChild(img);

      addFrame = document.createElement("div");
      addFrame.classList.add("add-frame");
      addFrame.classList.add("fa-solid", "fa-plus");

      addFrame.addEventListener("click", createNewFrame);

      frame.appendChild(addFrame);

      timeline.appendChild(frame);
    }

    if (type == "customAdd") {
      const img = document.createElement("img");
      img.src = `${location.origin}/public/images/empty.png`;
      img.width = paintCanvas.width;
      img.height = paintCanvas.height;

      const frame = document.createElement("div");
      frame.classList.add("frame");
      frame.id = uuidv4();

      const icon = document.createElement("i");

      icon.addEventListener("click", function () {
        frame.remove();
        currentlyEditing = "";
      });

      icon.classList.add("fas", "fa-trash-alt");
      frame.appendChild(icon);
      frame.appendChild(img);

      addFrame = document.createElement("div");
      addFrame.classList.add("add-frame");
      addFrame.classList.add("fa-solid", "fa-plus");

      addFrame.addEventListener("click", createNewFrame);

      frame.appendChild(addFrame);

      document.getElementById(image.parentNodeId).after(frame);
    }
  }

  function createNewFrame() {
    NewFrame({ parentNodeId: this.parentNode.id }, "customAdd");
  }

  //clear context
  const clearCanvas = () => {
    context.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
  };

  //draw the save image in a new canvas
  const drawSavedImages = (canvas) => {
    const savedCanvas = document.getElementById("saved-frame");
    savedCanvas.width = window.innerWidth;
    savedCanvas.height = window.innerHeight;
    const savedCanvascontext = savedCanvas.getContext("2d");
    savedCanvascontext.drawImage(
      canvas,
      0,
      0,
      savedCanvas.width,
      savedCanvas.height
    );
  };

  //clear saved canvas
  const clearSavedCanvas = () => {
    const savedCanvas = document.getElementById("saved-frame");
    const savedCanvascontext = savedCanvas.getContext("2d");
    savedCanvascontext.clearRect(0, 0, savedCanvas.width, savedCanvas.height);
  };

  document.getElementById("clear").addEventListener("click", function () {
    clearCanvas();
    clearSavedCanvas();
  });

  //print the clicked image in the timeline in the main canvas
  const printImage = (event) => {
    clearCanvas();
    clearSavedCanvas();
    const image = event.target;
    if (image.nodeName == "IMG") {
      if (!Array.from(image.classList).includes("js-timeline"))
        focusFrame(image);
      currentlyEditing = image.parentNode.id;

      context.drawImage(image, 0, 0);

      if (image.parentNode.previousSibling.id != undefined) {
        savedCanvascontext.drawImage(
          document.getElementById(image.parentNode.previousSibling.id)
            .children[1],
          0,
          0,
          savedCanvas.width,
          savedCanvas.height
        );
      }
    }
  };

  timeline.addEventListener("click", printImage);

  //play the timeline
  const playTimeline = () => {
    const images = document.querySelectorAll("img");
    let i = 0;
    const interval = setInterval(() => {
      if (i < images.length) {
        clearCanvas();
        context.drawImage(images[i], 0, 0);
        focusFrame(images[i]);
        i++;
      } else {
        if (looping) {
          i = 0;
        } else {
          clearInterval(interval);
        }
      }
    }, 100);
  };

  function focusFrame(focus) {
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      img.classList.remove("playing");
    });

    focus.classList.add("playing");
  }

  const keyisDown = (event) => {
    if (event.keyCode === 32) {
      saveDraw();
    }
    if (event.keyCode === 117) {
      clearCanvas();
      clearSavedCanvas();
      playTimeline();
    }

    if (event.keyCode == 90 && event.ctrlKey) {
      undo_last();
    }
  };

  function undo_last() {
    restore_array.pop();
    if (restore_array.length > 0) {
      context.putImageData(restore_array[restore_array.length - 1], 0, 0);
    } else {
      clearCanvas();
      restore_array = [];
    }
  }

  window.addEventListener("keydown", keyisDown);

  //generate uuid()
});
