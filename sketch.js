let backgroundColor = 255;
//Clientgröße 
let cWidth = document.getElementById("main").clientWidth;
let cHeight = document.getElementById("main").clientHeight;
console.log(cHeight);
let positionX = cWidth / 2;
let positionY = cHeight / 2;

let touch = false,
  keyboard = false,
  speech = false,
  mouse = true;

//input-vars
let speechRec, stopSpeech, up, left, down, right;
let prevTouch = []

//output-vars
let voice;

function setup() {

  px = x = cWidth / 2;
  py = y = cHeight / 2;
  speed = 4;
  noCursor()

  imageMode(CENTER)
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
  widthDiv = createDiv().parent('toolbar');
  createSpan('Width: ').parent(widthDiv);
  inpWidth = createInput(cWidth).parent(widthDiv).addClass("text-black");
  inpWidth.size(100);
  inpWidth.input(resizeEvent);
  //Einstellung für Höhe
  heightDiv = createDiv().parent('toolbar');
  createSpan('Height: ').parent(heightDiv);
  inpHeight = createInput(cHeight).parent(heightDiv).addClass("text-black");
  inpHeight.size(100);
  inpHeight.input(resizeEvent);
  //Pinselfarbe
  colorPicker = createColorPicker('#ed225d').parent('toolbar');
  //Standardbackground
  background(backgroundColor);
  colorMode(RGB);
  //checkBoxes for InputTypes
  mouseCheck = createCheckbox('Mouse', true).parent('mouse');
  mouseCheck.mousePressed(() => { mouse = !mouse });
  keyboardCheck = createCheckbox('Keyboard', false).parent('keyboard');
  keyboardCheck.mousePressed(() => {
    keyboard = !keyboard
  });
  touchCheck = createCheckbox('Touch', false).parent('touch');
  touchCheck.mousePressed(() => { touch = !touch });
  speechCheck = createCheckbox('Speech', false).parent('speech');
  speechCheck.mousePressed(
    () => {
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
    positionX = mouseX;
    positionY = mouseY;
    voice.speak("Position gesetzt");
  }
}

function draw() {

  background(255);
  image(drawing, cWidth / 2, cHeight / 2)
  checkSettings();
  if (keyboardCheck.checked()) {
    limCursor();
    space();
    keyCheck();
    mouseMoved(x, y);
  }
  if (mouseCheck.checked()) {
    noCursor()
    mouseMoved(mouseX, mouseY)
  } else {
    cursor()
  }



  if (keyboard) {
    if (keyIsDown(LEFT_ARROW)) {
      posChange("width", -1);
    } else if (keyIsDown(RIGHT_ARROW)) {
      posChange("width", 1);
    } else if (keyIsDown(DOWN_ARROW)) {
      posChange("height", 1);
    } else if (keyIsDown(UP_ARROW)) {
      posChange("height", -1);
    } else {
      select("#defaultCanvas0").removeClass("focused")
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
    if (checkClientSize(dim, positionY + value)) {
      line(positionX, positionY, positionX, positionY + value);
      positionY += value;
    }
  } else {
    if (checkClientSize(dim, positionX + value)) {
      line(positionX, positionY, positionX + value, positionY);
      positionX += value;
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
      voice.speak("Zeichne nach oben")
      break
    case "runter":
      down = true
      up = false
      right = false
      left = false
      voice.speak("Zeichne nach unten")
      break
    case "rechts":
      right = true
      up = false
      down = false
      left = false
      voice.speak("Zeichne nach rechts")
      break
    case "links":
      left = true
      up = false
      down = false
      right = false
      voice.speak("Zeichne nach links")
      break
    case "stopp":
      up = false
      down = false
      right = false
      left = false
      voice.speak("Zeichnen gestoppt")
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
  if (mouse && mouseX > 0 && mouseY > 0) {
    if (dragged === false) {
      select("#defaultCanvas0").addClass("focused")
    }
    checkSettings();
    positionX = pmouseX;
    positionY = pmouseY;
    drawing.line(mouseX, mouseY, pmouseX, pmouseY);
    drawing.stroke(colorPicker.color());
    drawing.strokeWeight(slider.value());
    dragged = true;
  }
}

function mouseReleased() {
  if (dragged) {
    select("#defaultCanvas0").removeClass("focused");
    voice.speak("Linie gezeichnet")
    dragged = false;
  }
}

function touchMoved() {
  if (touch) {
    checkSettings();
    for (let i = 0; i < touches.length; i++) {
      if (prevTouch[i]) {
        drawing.line(prevTouch[i].x, prevTouch[i].y, touches[i].x, touches[i].y);
      }
      prevTouch[i] = { x: touches[i].x, y: touches[i].y }
    }
    drawing.stroke(colorPicker.color());
    drawing.strokeWeight(slider.value());
  }
  return false;
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










function mouseMoved(x, y) {
  kpointer = createGraphics(cWidth, cHeight);
  strokeWeight(1);
  kpointer.fill(colorPicker.color())
  kpointer.rect(x - 10 - slider.value(), y - 1 - slider.value() / 4, 20 + slider.value() * 2, 2 + slider.value() / 2);
  kpointer.rect(x - 1 - slider.value() / 4, y - 10 - slider.value(), 2 + slider.value() / 2, 20 + slider.value() * 2);
  image(kpointer, cWidth / 2, cHeight / 2);
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
    drawing.line(x, y, px, py);
  }
}