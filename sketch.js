let backgroundColor = 255;
//Clientgröße 
let cWidth = document.getElementById("main").clientWidth;
let cHeight = document.getElementById("main").clientHeight;

let touch = false, keyboard = false, speech = false, mouse = true;
var stepsBack = [];
var stepsForward = [];
//input-vars
let speechRec, stopSpeech, up, left, down, right;
let prevTouch = []

//output-vars
let voice;

let saveStepOption = false
let undoOption = false
let load;
let textToSpeech = false;

let drawing_enabled = true;
const whModal = document.getElementById('whmodal')

whModal.addEventListener('shown.bs.modal', () => {
  drawing_enabled = false;
})

whModal.addEventListener('hidden.bs.modal', () => {
  drawing_enabled = true;
})

function setup() {
  px = x = cWidth / 2;
  py = y = cHeight / 2;
  speed = 4;
  pixelDensity(1);
  createCanvas(cWidth, cHeight).parent('main');

  drawing = createGraphics(cWidth, cHeight);
  //Beschreibung für den Slider
  createSpan("Change pen size:").parent('sliderDiv');
  //Slider für Pinselstärke
  slider = createSlider(1, 30, 5).parent('sliderDiv');
  slider.id("slider");
  //Button zum löschen des gemalten
  eraser = createButton("Clear").parent('toolbar').id('eraser').addClass("btn btn-danger");
  eraser.mousePressed(reset);
  //Radierer
  checkboxErase = createCheckbox('Erase', false).parent('toolbar');
  //Radiobuttons und Beschreibung für Pinselform
  createSpan("Change pen:").parent('radioDiv');
  radio = createRadio().parent('radioDiv');
  radio.option('square');
  radio.option('round');
  radio.selected('round');
  //Einstellung für Breite
  inpWidth = select('#width');
  inpWidth.value(cWidth)
  //Einstellung für Höhe
  inpHeight = select('#height');
  inpHeight.value(cHeight)
  //Save Changes for inpWidth and height
  inpChangesWH = select('#saveCustomWH')
  inpChangesWH.mouseClicked(resizeEvent);
  //Pinselfarbe
  colorPicker = createColorPicker('#ed225d').parent('toolbar');
  //Standardbackground
  background(backgroundColor);
  colorMode(RGB);
  let saveButton = select('#save');
  saveButton.mouseClicked(() => {
    saveCanvas("myCanvas", "png");
  })
  let openButton = select('#open');
  openButton.mouseClicked(() => {
    let input = createFileInput((file) => {
      if (file.type === 'image') {
        let urlOfImageFile = URL.createObjectURL(file.file);
        let imageObject = loadImage(urlOfImageFile, () => {
          cHeight = Math.min(imageObject.height, cHeight)
          cWidth = Math.min(imageObject.width, cWidth)
          resizeCanvas(cWidth, cHeight);
          saveDrawing()
          drawing.image(imageObject, 0, 0, cWidth, cHeight)
        });
      } else {
        img = null;
      }
    }, false);
    input.hide();
    input.elt.click();
  })

  //Undo und Redo
  undo = select('#undo');
  undo.mouseClicked(() => {
    stepsBack.pop()
    undoStep()
  });
  redo = select('#redo');
  redo.mouseClicked(() => {
    stepsBack.pop()
    //stepsForward.pop()
    redoStep()
  });

  //toggle voice
  select('#voice').mouseClicked(() => {
    textToSpeech = !textToSpeech;
  });
  //toggle to different undo redo mode
  select('#urtype').mouseClicked(() => {
    undoOption = !undoOption;
  });

  //checkBoxes for InputTypes
  mouseCheck = createCheckbox('Mouse', true).parent('mouse');
  mouseCheck.mousePressed(() => {
    mouse = !mouse
  });
  keyboardCheck = createCheckbox('Keyboard', false).parent('keyboard');
  keyboardCheck.mousePressed(() => {
    keyboard = !keyboard
    if (keyboard) {
      cursor(CROSS)
    } else {
      cursor()
    }
  });
  touchCheck = createCheckbox('Touch', false).parent('touch');
  touchCheck.mousePressed(() => {
    touch = !touch
  });
  speechCheck = createCheckbox('Speech', false).parent('speech');
  speechCheck.mousePressed(() => {
    speech = !speech;
    if (speech) {
      speechRec.start();
    } else {
      speechRec.stop();
    }
  });
  //p5.Speech
  let lang = 'de-DE';
  speechRec = new p5.SpeechRec(lang);
  speechRec.continuous = true;
  speechRec.interimResults = true;
  speechRec.onResult = speechMovement;

  voice = new p5.Speech();
  voice.onLoad = () => {
    voice.setLang("de-DE");
  };
}

function doubleClicked() {
  if (mouseX > 0 && mouseY > 0) {
    x = mouseX;
    y = mouseY;
    if (textToSpeech) {
      voice.speak("Position gesetzt");
    }
  }
}

function draw() {
  image(drawing, 0, 0)
  checkSettings();
  if (keyboardCheck.checked()) {
    limCursor();
    space();
    keyCheck();
  }
  if (undoOption) {
    if (keyIsDown(17) && keyIsDown(90)) {
      undoStep()
    } else if (keyIsDown(17) && keyIsDown(89)) {
      redoStep()
    }
  }

  if (speech) {
    if (left) {
      posChange("width", -1);
    } else if (right) {
      posChange("width", 1);
    } else if (down) {
      posChange("height", 1);
    } else if (up) {
      posChange("height", -1);
    } else {
      select("#defaultCanvas0").removeClass("focused")
    }
  }
  stroke(colorPicker.color());
  strokeWeight(slider.value());
}

function posChange(dim, value) {
  if (dim === "height") {
    if (checkClientSize(dim, y + value)) {
      drawLine(x, y, x, y + value);
      positionY += value;
    }
  } else {
    if (checkClientSize(dim, x + value)) {
      drawLine(x, y, x + value, y);
      x += value;
    }
  }
  select("#defaultCanvas0").addClass("focused")
}


function speechMovement() {
  switch (speechRec.resultString) {
    case "hoch":
      up = true
      down = false
      right = false
      left = false
      if (textToSpeech) {
        voice.speak("Zeichne nach oben")
      }
      break
    case "runter":
      down = true
      up = false
      right = false
      left = false
      if (textToSpeech) {
        voice.speak("Zeichne nach unten")
      }
      break
    case "rechts":
      right = true
      up = false
      down = false
      left = false
      if (textToSpeech) {
        voice.speak("Zeichne nach rechts")
      }
      break
    case "links":
      left = true
      up = false
      down = false
      right = false
      if (textToSpeech) {
        voice.speak("Zeichne nach links")
      }
      break
    case "stopp":
      up = false
      down = false
      right = false
      left = false
      if (textToSpeech) {
        voice.speak("Zeichnen gestoppt")
      }
      break
  }
}


function resizeEvent() {
  //Größen auf neuen Wert setzen, falls clear
  cWidth = inpWidth.value();
  cHeight = inpHeight.value();
  resizeCanvas(cWidth, cHeight);
  background(backgroundColor);
}

let dragged = false;

function mouseDragged() {
  if (drawing_enabled) {
    if (mouse && mouseX > 0 && mouseY > 0) {
      if (dragged === false) {
        select("#defaultCanvas0").addClass("focused")
      }
      checkSettings();
      x = pmouseX;
      y = pmouseY;
      drawLine(mouseX, mouseY, pmouseX, pmouseY);
      drawing.stroke(colorPicker.color());
      drawing.strokeWeight(slider.value());
      dragged = true;
    }
  }
}

function mouseReleased() {
  if (dragged) {
    select("#defaultCanvas0").removeClass("focused");
    if (textToSpeech) {
      voice.speak("Linie gezeichnet")
    }
    dragged = false;
  }
}

function touchMoved() {
  if (drawing_enabled) {
    if (touch) {
      checkSettings();
      for (let i = 0; i < touches.length; i++) {
        if (prevTouch[i]) {
          drawLine(prevTouch[i].x, prevTouch[i].y, touches[i].x, touches[i].y);
        }
        prevTouch[i] = { x: touches[i].x, y: touches[i].y }
      }
      drawing.stroke(colorPicker.color());
      drawing.strokeWeight(slider.value());
    }
    return false;
  }
}

function touchStarted() {
  prevTouch = [];
  return false;
}

function touchEnded() {
  prevTouch = [];
  return false;
}

function checkClientSize(dim, value) {
  let re = true;
  if (dim === "height") {
    if (value >= cHeight || value <= 0) {
      re = false;
    }
  } else {
    if (value >= cWidth || value <= 0) {
      re = false;
    }
  }
  return re;
}

function checkSettings() {
  if (checkboxErase.checked()) {
    stroke(backgroundColor);
  }
  if (radio.value() === 'round') {
    strokeCap(ROUND);
  } else if (radio.value() === 'square') {
    strokeCap(SQUARE);
  }
}

function reset() {
  resizeCanvas(cWidth, cHeight);
  background(backgroundColor);
}


function drawLine(position1X, position1Y, position2X, position2Y) {
  if (saveStepOption) {
    saveDrawing()
  }
  drawing.line(position1X, position1Y, position2X, position2Y);
}

function saveDrawing() {
  saveStep(stepsBack)
  stepsForward = []
}

function undoStep() {
  console.log(stepsForward.length)
  if (stepsBack.length >= 1) {
    saveStep(stepsForward)
    drawing.image(stepsBack.pop(), 0, 0)
  }
  console.log(stepsForward.length)
}
function redoStep() {
  console.log(stepsForward.length)
  if (stepsForward.length >= 1) {
    saveStep(stepsBack)
    drawing.image(stepsForward.pop(), 0, 0)
  }
  console.log(stepsForward.length)
}

function saveStep(array) {
  current = createGraphics(cWidth, cHeight);
  current.background(255);
  current.image(drawing, 0, 0);
  array.push(current);
}


function mousePressed() {
  if (!saveStepOption) {
    saveDrawing()
  }
}

function keyPressed() {
  if (!undoOption) {
    if ((key == "Control" && keyIsDown(90)) || (key == "z" && keyIsDown(17))) {
      undoStep()
    } else if ((key == "Control" && keyIsDown(89)) || (key == "y" && keyIsDown(17))) {
      redoStep()
    }
  }
}

function cursorMoved(x, y) {
  //ignore this code
  kpointer = createGraphics(cWidth, cHeight);
  kpointer.fill(colorPicker.color())
  kpointer.rect(x - 10, y - 1, 20, 2);
  kpointer.rect(x - 1, y - 10, 2, 20);
  image(kpointer, cWidth / 2, cHeight / 2);
  delete kpointer
}

function limCursor() {
  if (x > cWidth) x = cWidth;
  if (x < 0) x = 0;
  if (y > cHeight) y = cHeight;
  if (y < 0) y = 0;
}

function keyCheck() {
  px = x;
  py = y;
  if (keyIsDown(UP_ARROW)) y -= speed;
  if (keyIsDown(DOWN_ARROW)) y += speed;
  if (keyIsDown(RIGHT_ARROW)) x += speed;
  if (keyIsDown(LEFT_ARROW)) x -= speed;
}

function space() {
  if (keyIsDown(67)) {
    drawing.stroke(colorPicker.color());
    drawing.strokeWeight(slider.value());
    drawLine(x, y, px, py);
  }
}