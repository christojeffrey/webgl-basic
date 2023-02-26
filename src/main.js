import { createCanvas, rerender, cancelDrawing, createPoint, setBackground, finishDrawing, createPolygon, createLine, objectToBeDrawn, objectBeingDrawn } from "./mainInterface.js";
import { getXY } from "./utils.js";
import { convexHull, removeUnusedPoints, triangulate } from "./polygonHelper.js";
import { rectangle, triangle, square } from "./helper.js"
import { resizeSquare } from "./squareHelper.js";

const TOLERANCE = 0.01;

let objectToBeMoved = null;
let isDragging = false;
let clickedIndex = null;
let clickedPoint = null;
let verticesDrawn = 0;
/*============== Creating a canvas ====================*/
let canvas = createCanvas(1000, 1200);

// bind import-button and export-button
let importButton = document.getElementById("import-button");
let exportButton = document.getElementById("export-button");

importButton.addEventListener("click", function () {
  // take a file from input id file-input, read and parse it as json and save it to objectToBeDrawn
  let file = document.getElementById("file-input").files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    let temp = JSON.parse(reader.result);
    // pop all
    for (let i = 0; i < objectToBeDrawn.length; i++) {
      objectToBeDrawn.pop();
    }
    for (let i = 0; i < temp.length; i++) {
      objectToBeDrawn.push(temp[i]);
    }
    rerender();
    updateObjectList();
  };
});

exportButton.addEventListener("click", function () {
  // take objectToBeDrawn and save it as json file
  let data = JSON.stringify(objectToBeDrawn);
  let blob = new Blob([data], { type: "text/plain" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "drawing.json";
  a.click();
});

// listen for drawItem id dropdown value
let drawItem = document.getElementById("drawItem");
let objectList = document.getElementById("objectList");
let drawItemValue = "none";
drawItem.addEventListener("change", function () {
  drawItemValue = drawItem.value;
  console.log(drawItemValue);
});

canvas.onmousedown = handleMouseDown;
canvas.onmouseenter = handleMouseHover;
canvas.onmousemove = handleMouseMove;
canvas.onmouseup = handleMouseUp;

// Handle unclicked mouse
function handleMouseUp(e) {
  isDragging = false;
  objectToBeMoved = null;
}

// Handle mouse on canvas, change to crosshair
function handleMouseHover(_) {
  canvas.style.cursor = "crosshair";
}

// Handle mouse on move, used to handle dragging, and drawing animation
function handleMouseMove(e) {

  // Handle mouse in drag
  if (isDragging) {
    const { x, y } = getXY(e, canvas);

    // HANDLE MOVING OBJECT BY DRAGGING
    if (drawItemValue == "none") {

      // get the object that is being dragged
      if (objectToBeMoved == null) {
        for (let i = 0; i < objectToBeDrawn.length; i++) {
          let item = objectToBeDrawn[i];

          // define where the object is
          // Find the point with distance lower than tolerance
          if (item.type == "point") {
            if (Math.abs(item.x - x) < TOLERANCE && Math.abs(item.y - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              break;
            }
          }

          if (item.type == "line") {
            if (Math.abs(item.x1 - x) < TOLERANCE && Math.abs(item.y1 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 1;
              break;
            } else if (Math.abs(item.x2 - x) < TOLERANCE && Math.abs(item.y2 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 2;
              break;
            }
          }

          if (item.type == "triangle") {
            if (Math.abs(item.x1 - x) < TOLERANCE && Math.abs(item.y1 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 1;
              break;
            } else if (Math.abs(item.x2 - x) < TOLERANCE && Math.abs(item.y2 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 2;
              break;
            } else if (Math.abs(item.x3 - x) < TOLERANCE && Math.abs(item.y3 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 3;
              break;
            }
          }

          if (item.type == "rectangle" || item.type == "square") {
            if (Math.abs(item.x1 - x) < TOLERANCE && Math.abs(item.y1 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 1;
              break;
            } else if (Math.abs(item.x2 - x) < TOLERANCE && Math.abs(item.y2 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 2;
              break;
            } else if (Math.abs(item.x3 - x) < TOLERANCE && Math.abs(item.y3 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 3;
              break;
            } else if (Math.abs(item.x4 - x) < TOLERANCE && Math.abs(item.y4 - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              clickedPoint = 4;
              break;
            }
          }
        }
      }

      // now we have the object that is being dragged. We need to move it
      if (objectToBeMoved != null) {
        if (objectToBeMoved.type == "point") {
          objectToBeMoved.x = x;
          objectToBeMoved.y = y;

          setProperties();
          rerender();

        } else if (objectToBeMoved.type == "line") {
          if (clickedPoint == 1) {
            objectToBeMoved.x1 = x;
            objectToBeMoved.y1 = y;
          } else if (clickedPoint == 2) {
            objectToBeMoved.x2 = x;
            objectToBeMoved.y2 = y;
          }

          setProperties();
          rerender();

        } else if (objectToBeMoved.type == "triangle") {
          if (clickedPoint == 1) {
            objectToBeMoved.x1 = x;
            objectToBeMoved.y1 = y;
          } else if (clickedPoint == 2) {
            objectToBeMoved.x2 = x;
            objectToBeMoved.y2 = y;
          } else if (clickedPoint == 3) {
            objectToBeMoved.x3 = x;
            objectToBeMoved.y3 = y;
          }

          setProperties();
          rerender();
        } else if (objectToBeMoved.type == "rectangle") {
            if (clickedPoint == 1) {
              console.log("Click: 1")
              objectToBeMoved.x1 = x;
              objectToBeMoved.y1 = y;
              if (objectToBeMoved.rect == "y") {
                objectToBeMoved.x2 = x;
                objectToBeMoved.y4 = y;
              } else {
                objectToBeMoved.x4 = x;
                objectToBeMoved.y2 = y;
              } 
            } else if (clickedPoint == 2) {
              console.log("Click: 2")
              objectToBeMoved.x2 = x;
              objectToBeMoved.y2 = y;
              if (objectToBeMoved.rect == "y") {
                objectToBeMoved.x1 = x;
                objectToBeMoved.y3 = y;
              } else {
                objectToBeMoved.x3 = x;
                objectToBeMoved.y1 = y;
              } 
            } else if (clickedPoint == 3) {
              console.log("Click: 3")
              objectToBeMoved.x3 = x;
              objectToBeMoved.y3 = y;
              if (objectToBeMoved.rect == "y") {
                objectToBeMoved.x4 = x;
                objectToBeMoved.y2 = y;
              } else {
                objectToBeMoved.x2 = x;
                objectToBeMoved.y4 = y;
              } 
            } else if (clickedPoint == 4) {
              console.log("Click: 4")
              objectToBeMoved.x4 = x;
              objectToBeMoved.y4 = y;
              if (objectToBeMoved.rect == "y") {
                objectToBeMoved.x3 = x;
                objectToBeMoved.y1 = y;
              } else {
                objectToBeMoved.x1 = x;
                objectToBeMoved.y3 = y;
              } 
            }
          
          setProperties();
          rerender();
        } else if (objectToBeMoved.type == "square") {
          let x1 = objectToBeMoved.x1;
          let y1 = objectToBeMoved.y1;
          let x2 = objectToBeMoved.x2;
          let y2 = objectToBeMoved.y2;
          let x3 = objectToBeMoved.x3;
          let y3 = objectToBeMoved.y3;
          let x4 = objectToBeMoved.x4;
          let y4 = objectToBeMoved.y4;

          if (clickedPoint == 1) {
            let result = resizeSquare(x, y, x1, y1, x2, y2, x4, y4);
            objectToBeMoved.x1 = result[0];
            objectToBeMoved.y1 = result[1];
            objectToBeMoved.x2 = result[2];
            objectToBeMoved.y2 = result[3];
            objectToBeMoved.x4 = result[4];
            objectToBeMoved.y4 = result[5];
          } else if (clickedPoint == 2) {
            let result = resizeSquare(x, y, x2, y2, x3, y3, x1, y1);
            objectToBeMoved.x2 = result[0];
            objectToBeMoved.y2 = result[1];
            objectToBeMoved.x3 = result[2];
            objectToBeMoved.y3 = result[3];
            objectToBeMoved.x1 = result[4];
            objectToBeMoved.y1 = result[5];
          } else if (clickedPoint == 3) {
            let result = resizeSquare(x, y, x3, y3, x4, y4, x2, y2);
            objectToBeMoved.x3 = result[0];
            objectToBeMoved.y3 = result[1];
            objectToBeMoved.x4 = result[2];
            objectToBeMoved.y4 = result[3];
            objectToBeMoved.x2 = result[4];
            objectToBeMoved.y2 = result[5];
          } else if (clickedPoint == 4) {
            let result = resizeSquare(x, y, x4, y4, x1, y1, x3, y3);
            objectToBeMoved.x4 = result[0];
            objectToBeMoved.y4 = result[1];
            objectToBeMoved.x1 = result[2];
            objectToBeMoved.y1 = result[3];
            objectToBeMoved.x3 = result[4];
            objectToBeMoved.y3 = result[5];
          } 

          setProperties();
          rerender();
        }
      }
    }
  }

  // HANDLE ANIMATION WHEN DRAWING
  if (verticesDrawn != 0) {
    const { x, y } = getXY(e, canvas);
    if (drawItemValue == "line") {
      // on the proccess drawing line
      objectBeingDrawn.x2 = x;
      objectBeingDrawn.y2 = y;
    } else if (drawItemValue == "triangle") {
      // on the proccess drawing triangle
      if (verticesDrawn == 1) {
        objectBeingDrawn.x2 = x;
        objectBeingDrawn.y2 = y;
      }
      if (verticesDrawn == 2) {
        objectBeingDrawn.x3 = x;
        objectBeingDrawn.y3 = y;
      }
    }
    rerender();
  }
}

// Handle mouse when clicked, used to handle drawing object
function handleMouseDown(e) {
  isDragging = true;
  const { x, y } = getXY(e, canvas);

  // draw based on dropdown value
  switch (drawItemValue) {
    case "none":
      break;

    case "point":
      // add to list of objects
      createPoint(x, y);
      break;

    case "line":
      // initiate drawing line
      if (verticesDrawn == 0) {
        objectBeingDrawn.type = "line";
        objectBeingDrawn.x1 = x;
        objectBeingDrawn.y1 = y;
        verticesDrawn++;
      } else if (verticesDrawn == 1) {
        objectBeingDrawn.x2 = x;
        objectBeingDrawn.y2 = y;
        finishDrawing();
        verticesDrawn = 0;
      }
      break;
      
    case "triangle":
      // initiate drawing triangle
      if (verticesDrawn == 0) {
        objectBeingDrawn.type = "triangle";
        objectBeingDrawn.x1 = x;
        objectBeingDrawn.y1 = y;
        verticesDrawn++;
      } else if (verticesDrawn == 1) {
        objectBeingDrawn.x2 = x;
        objectBeingDrawn.y2 = y;
        verticesDrawn++;
      } else if (verticesDrawn == 2) {
        objectBeingDrawn.x3 = x;
        objectBeingDrawn.y3 = y;
        finishDrawing();
        verticesDrawn = 0;
      }
      break;

    case "rectangle":
      // initiate drawing rectangle
      if (verticesDrawn == 0) {
        objectBeingDrawn.type = "rectangle";
        objectBeingDrawn.degree = 0;
        objectBeingDrawn.x1 = x;
        objectBeingDrawn.y1 = y;
        verticesDrawn++;
      } else if (verticesDrawn == 1) {
        if (Math.abs(objectBeingDrawn.x1 - x) > Math.abs(objectBeingDrawn.y1 - y)) {
          objectBeingDrawn.x2 = x;
          objectBeingDrawn.y2 = objectBeingDrawn.y1;
          objectBeingDrawn.rect = "x";
        } else {
          objectBeingDrawn.x2 = objectBeingDrawn.x1;
          objectBeingDrawn.y2 = y;
          objectBeingDrawn.rect = "y";
        }
        verticesDrawn++;
      } else if (verticesDrawn == 2) {
        if (objectBeingDrawn.rect == "y") {
          objectBeingDrawn.x3 = x;
          objectBeingDrawn.y3 = objectBeingDrawn.y2;
        } else {
          objectBeingDrawn.x3 = objectBeingDrawn.x2;
          objectBeingDrawn.y3 = y;
        }
        verticesDrawn++;
      } else if (verticesDrawn == 3) {
        if (objectBeingDrawn.rect == "x") {
          objectBeingDrawn.x4 = objectBeingDrawn.x1;
          objectBeingDrawn.y4 = objectBeingDrawn.y3;
        } else {
          objectBeingDrawn.x4 = objectBeingDrawn.x3;
          objectBeingDrawn.y4 = objectBeingDrawn.y1;
        }
        finishDrawing();
        verticesDrawn = 0;
      }
      break;

      case "square":
        let squareLength;
        // initiate drawing square
        if (verticesDrawn == 0) {
          objectBeingDrawn.type = "square";
          objectBeingDrawn.x1 = x;
          objectBeingDrawn.y1 = y;
          verticesDrawn++;
        } else if (verticesDrawn == 1) {
          if (Math.abs(objectBeingDrawn.x1 - x) > Math.abs(objectBeingDrawn.y1 - y)) {
            objectBeingDrawn.x2 = x;
            objectBeingDrawn.y2 = objectBeingDrawn.y1;
          } else {
            objectBeingDrawn.x2 = objectBeingDrawn.x1;
            objectBeingDrawn.y2 = y;
          }
          verticesDrawn++;
        } else if (verticesDrawn == 2) {
          if (objectBeingDrawn.rect == "y") {
            squareLength = Math.abs(objectBeingDrawn.y2 - objectBeingDrawn.y1);
            if (x >= objectBeingDrawn.x2) {
              objectBeingDrawn.x3 = objectBeingDrawn.x2 + squareLength;
            } else {
              objectBeingDrawn.x3 = objectBeingDrawn.x2 - squareLength;
            }
            objectBeingDrawn.y3 = objectBeingDrawn.y2;
          } else {
            squareLength = Math.abs(objectBeingDrawn.x2 - objectBeingDrawn.x1);
            if (y >= objectBeingDrawn.y2) {
              objectBeingDrawn.y3 = objectBeingDrawn.y2 + squareLength;
            } else {
              objectBeingDrawn.y3 = objectBeingDrawn.y2 - squareLength;
            }
            objectBeingDrawn.x3 = objectBeingDrawn.x2;
          }
          verticesDrawn++;
        } else if (verticesDrawn == 3) {
          if (objectBeingDrawn.rect == "x") {
            squareLength = Math.abs(objectBeingDrawn.y2 - objectBeingDrawn.y1);
            objectBeingDrawn.x4 = objectBeingDrawn.x1;
            objectBeingDrawn.y4 = objectBeingDrawn.y3;
          } else {
            squareLength = Math.abs(objectBeingDrawn.x2 - objectBeingDrawn.x1);
            objectBeingDrawn.x4 = objectBeingDrawn.x3;
            objectBeingDrawn.y4 = objectBeingDrawn.y1;
          }
          finishDrawing();
          verticesDrawn = 0;
        }
        break;

    case "polygon":
      // initiate drawing polygon
      objectBeingDrawn.type = "polygon";
      // create a sides array
      if (verticesDrawn == 0) {
        objectBeingDrawn.originalPoints = [];
      }
      objectBeingDrawn.originalPoints.push([x, y]);
      // filter with convex hull
      // add point to sides array

      let points = convexHull(objectBeingDrawn.originalPoints);

      points = removeUnusedPoints(points);
      console.log("points");
      console.log(points);

      let triangles = triangulate(points);

      console.log("triangles");
      for (let i = 0; i < triangles.length; i++) {
        console.log(triangles[i]);
      }

      objectBeingDrawn.points = points;
      objectBeingDrawn.triangles = triangles;
      console.log("objectBeingDrawn");
      console.log(objectBeingDrawn);
      verticesDrawn++;
      break;

    // stop on key press enter
  }
  rerender();
  updateObjectList();
}

function deleteObject(e) {
  // prevent event propagation
  e.stopPropagation();
  let index = e.target.getAttribute("data-index");
  objectToBeDrawn.splice(index, 1);
  updateObjectList();
  rerender();
}

// update UI
// update objectList on left nav
function updateObjectList() {
  // add li to objectList from objectToBeDrawn
  objectList.innerHTML = "";
  for (let i = 0; i < objectToBeDrawn.length; i++) {
    let li = document.createElement("li");
    // give the type, and a delete button
    li.innerHTML = `
    <div class="object-list-item" data-index=${i}>
      <div class="object-list-item-type" data-index=${i}>${objectToBeDrawn[i].type}</div>
      <div class="object-list-item-delete" data-index="${i}">X</div>
    </div>
    `;
    li.querySelector(".object-list-item-delete").addEventListener("click", deleteObject);
    li.setAttribute("data-index", i);

    li.addEventListener("click", function (e) {
      clickedIndex = e.target.getAttribute("data-index");
      console.log("Click ", clickedIndex);
      setProperties();
    });
    objectList.appendChild(li);
  }
}

// set properties on right nav
function setProperties() {
  // set properties based on clickedIndex
  let html;

  if (objectToBeDrawn[clickedIndex].type == "point") {
    let x = objectToBeDrawn[clickedIndex].x;
    let y = objectToBeDrawn[clickedIndex].y;
    let degree = objectToBeDrawn[clickedIndex].degree;
    let colorHex = objectToBeDrawn[clickedIndex].colorHex;
    // round x and y
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;
    html = `
    <form id="pointProperties">
      <div id="properties-title">
        <h3>Point Properties</h3>
      </div>
      <div>
        <label for="x">x</label>
        <input id="x" value=${x} />
      </div>
      <div>
        <label for="y">y</label>
        <input id="y" value=${y} />
      </div>
      <div>
      <input type="color" id="colorHex" name="favcolor" value=${colorHex}>
      </div>
      <input type="submit">
      </form>
      <div id="rotation">
        <h4>Rotation</h4>
        <label for="rotate">θ</label>
        <input type="range" min=0 max=360 value=${degree} class="slider" id="rotate"/>
      </div>
    `;
    let properties = document.getElementById("properties");
    properties.innerHTML = html;

    // add event listener to form
    let form = document.getElementById("pointProperties");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let x = document.getElementById("x").value;
      let y = document.getElementById("y").value;
      let colorHex = document.getElementById("colorHex").value;
      objectToBeDrawn[clickedIndex].x = x;
      objectToBeDrawn[clickedIndex].y = y;
      console.log("colorHex", colorHex);
      objectToBeDrawn[clickedIndex].colorHex = colorHex;
      rerender();
    });

    let rotate = document.getElementById("rotate");
    rotate.addEventListener("input", function (e) {
      e.preventDefault()

      let x = document.getElementById("x").value;
      let y = document.getElementById("y").value;
      let deg = Math.atan()
    })
  } else if (objectToBeDrawn[clickedIndex].type == "line") {
    let x1 = objectToBeDrawn[clickedIndex].x1;
    let y1 = objectToBeDrawn[clickedIndex].y1;
    let x2 = objectToBeDrawn[clickedIndex].x2;
    let y2 = objectToBeDrawn[clickedIndex].y2;
    let colorHex = objectToBeDrawn[clickedIndex].colorHex;
    html = `
    <form id="lineProperties">
      <div id="properties-title">
        <h3>Line Properties</h3>
      </div>
      <div>
        <label for="x1">x1</label>
        <input id="x1" value=${x1} />
      </div>
      <div>
        <label for="y1">y1</label>
        <input id="y1" value=${y1} />
      </div>
      <div>
        <label for="x2">x2</label>
        <input id="x2" value=${x2} />
      </div>
      <div>
        <label for="y2">y2</label>
        <input id="y2" value=${y2} />
      </div>
      <div class="rotate">
        <h4>Rotate</h4>
        <input type="text" id="rotate" name="rotate">
      </div>
      <div>
      <input type="color" id="colorHex" name="favcolor" value=${colorHex}>
      </div>
      <input type="submit">
      </form>
    `;
    let properties = document.getElementById("properties");
    properties.innerHTML = html;

    // add event listener to form
    let form = document.getElementById("lineProperties");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let x1 = document.getElementById("x1").value;
      let y1 = document.getElementById("y1").value;
      let x2 = document.getElementById("x2").value;
      let y2 = document.getElementById("y2").value;
      let colorHex = document.getElementById("colorHex").value;
      objectToBeDrawn[clickedIndex].x1 = x1;
      objectToBeDrawn[clickedIndex].y1 = y1;
      objectToBeDrawn[clickedIndex].x2 = x2;
      objectToBeDrawn[clickedIndex].y2 = y2;
      objectToBeDrawn[clickedIndex].colorHex = colorHex;
      rerender();
    });
  } else if (objectToBeDrawn[clickedIndex].type == "triangle") {
    let x1 = objectToBeDrawn[clickedIndex].x1;
    let y1 = objectToBeDrawn[clickedIndex].y1;
    let x2 = objectToBeDrawn[clickedIndex].x2;
    let y2 = objectToBeDrawn[clickedIndex].y2;
    let x3 = objectToBeDrawn[clickedIndex].x3;
    let y3 = objectToBeDrawn[clickedIndex].y3;
    let colorHex = objectToBeDrawn[clickedIndex].colorHex;
    html = `
    <form id="triangleProperties">
      <div id="properties-title">
        <h3>Triangle Properties</h3>
      </div>
      <div>
        <label for="x1">x1</label>
        <input id="x1" value=${x1} />
      </div>
      <div>
        <label for="y1">y1</label>
        <input id="y1" value=${y1} />
      </div>
      <div>
        <label for="x2">x2</label>
        <input id="x2" value=${x2} />
      </div>
      <div>
        <label for="y2">y2</label>
        <input id="y2" value=${y2} />
      </div>
      <div>
        <label for="x3">x3</label>
        <input id="x3" value=${x3} />
      </div>
      <div>
        <label for="y3">y3</label>
        <input id="y3" value=${y3} />
      </div>
      <div class="rotate">
        <h4>Rotate</h4>
        <input type="text" id="rotate" name="rotate">
      </div>
      <div>
      <input type="color" id="colorHex" name="favcolor" value=${colorHex}>
      </div>
      <input type="submit">
      </form>
    `;
    let properties = document.getElementById("properties");
    properties.innerHTML = html;

    // add event listener to form
    let form = document.getElementById("triangleProperties");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let x1 = document.getElementById("x1").value;
      let y1 = document.getElementById("y1").value;
      let x2 = document.getElementById("x2").value;
      let y2 = document.getElementById("y2").value;
      let x3 = document.getElementById("x3").value;
      let y3 = document.getElementById("y3").value;
      let colorHex = document.getElementById("colorHex").value;
      objectToBeDrawn[clickedIndex].x1 = x1;
      objectToBeDrawn[clickedIndex].y1 = y1;
      objectToBeDrawn[clickedIndex].x2 = x2;
      objectToBeDrawn[clickedIndex].y2 = y2;
      objectToBeDrawn[clickedIndex].x3 = x3;
      objectToBeDrawn[clickedIndex].y3 = y3;
      objectToBeDrawn[clickedIndex].colorHex = colorHex;
      rerender();
    });
  } else if (objectToBeDrawn[clickedIndex].type == "rectangle") {
    let x1 = objectToBeDrawn[clickedIndex].x1;
    let y1 = objectToBeDrawn[clickedIndex].y1;
    let x2 = objectToBeDrawn[clickedIndex].x2;
    let y2 = objectToBeDrawn[clickedIndex].y2;
    let x3 = objectToBeDrawn[clickedIndex].x3;
    let y3 = objectToBeDrawn[clickedIndex].y3;
    let x4 = objectToBeDrawn[clickedIndex].x4;
    let y4 = objectToBeDrawn[clickedIndex].y4;
    let degree = objectToBeDrawn[clickedIndex].degree;
    let colorHex = objectToBeDrawn[clickedIndex].colorHex;
    html = `
    <form id="rectangleProperties">
      <div id="properties-title">
        <h3>Rectangle Properties</h3>
      </div>
      <div>
        <label for="x1">x1</label>
        <input id="x1" value=${x1} />
      </div>
      <div>
        <label for="y1">y1</label>
        <input id="y1" value=${y1} />
      </div>
      <div>
        <label for="x2">x2</label>
        <input id="x2" value=${x2} />
      </div>
      <div>
        <label for="y2">y2</label>
        <input id="y2" value=${y2} />
      </div>
      <div>
        <label for="x3">x3</label>
        <input id="x3" value=${x3} />
      </div>
      <div>
        <label for="y3">y3</label>
        <input id="y3" value=${y3} />
      </div>
      <div>
        <label for="x4">x4</label>
        <input id="x4" value=${x4} />
      </div>
      <div>
        <label for="y4">y4</label>
        <input id="y4" value=${y4} />
      </div>
      <input type="color" id="colorHex" name="favcolor" value=${colorHex}>
      </div>
      <input type="submit">
      </form>
      <div id="translation">
        <h4>Translation</h4>
        <label for="trans-x">x</label>
        <input type="range" min=-100 max=100 value=${x1} class="slider" id="trans-x"/> <p></p>
        <label for="trans-y">y</label>
        <input type="range" min=-100 max=100 value=${y1} class="slider" id="trans-y"/>
      </div>
      <div id="rotation">
        <h4>Rotation</h4>
        <label for="rotate">θ</label>
        <input type="range" min=0 max=360 value=${degree} class="slider" id="rotate"/>
      </div>
    `;
    let properties = document.getElementById("properties");
    properties.innerHTML = html;

    // add event listener to form
    let form = document.getElementById("rectangleProperties");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let x1 = document.getElementById("x1").value;
      let y1 = document.getElementById("y1").value;
      let x2 = document.getElementById("x2").value;
      let y2 = document.getElementById("y2").value;
      let x3 = document.getElementById("x3").value;
      let y3 = document.getElementById("y3").value;
      let x4 = document.getElementById("x4").value;
      let y4 = document.getElementById("y4").value;
      let colorHex = document.getElementById("colorHex").value;
      objectToBeDrawn[clickedIndex].x1 = x1;
      objectToBeDrawn[clickedIndex].y1 = y1;
      objectToBeDrawn[clickedIndex].x2 = x2;
      objectToBeDrawn[clickedIndex].y2 = y2;
      objectToBeDrawn[clickedIndex].x3 = x3;
      objectToBeDrawn[clickedIndex].y3 = y3;
      objectToBeDrawn[clickedIndex].x4 = x4;
      objectToBeDrawn[clickedIndex].y4 = y4;
      objectToBeDrawn[clickedIndex].colorHex = colorHex;
      rerender();
    });

    let transx = document.getElementById("trans-x");
    transx.addEventListener("input", function (e) {
      e.preventDefault();
      let x1 = transx.value / 100;
      let distx2 = objectToBeDrawn[clickedIndex].x2 - objectToBeDrawn[clickedIndex].x1;
      let distx3 = objectToBeDrawn[clickedIndex].x3 - objectToBeDrawn[clickedIndex].x1;
      let distx4 = objectToBeDrawn[clickedIndex].x4 - objectToBeDrawn[clickedIndex].x1;

      objectToBeDrawn[clickedIndex].x1 = x1;
      objectToBeDrawn[clickedIndex].x2 = objectToBeDrawn[clickedIndex].x1 + distx2;
      objectToBeDrawn[clickedIndex].x3 = objectToBeDrawn[clickedIndex].x1 + distx3;
      objectToBeDrawn[clickedIndex].x4 = objectToBeDrawn[clickedIndex].x1 + distx4;
      rerender();
    });

    let transy = document.getElementById("trans-y");
    transy.addEventListener("input", function (e) {
      e.preventDefault();
      let y1 = transy.value / -100;
      let disty2 = objectToBeDrawn[clickedIndex].y2 - objectToBeDrawn[clickedIndex].y1;
      let disty3 = objectToBeDrawn[clickedIndex].y3 - objectToBeDrawn[clickedIndex].y1;
      let disty4 = objectToBeDrawn[clickedIndex].y4 - objectToBeDrawn[clickedIndex].y1;

      objectToBeDrawn[clickedIndex].y1 = y1;
      objectToBeDrawn[clickedIndex].y2 = objectToBeDrawn[clickedIndex].y1 + disty2;
      objectToBeDrawn[clickedIndex].y3 = objectToBeDrawn[clickedIndex].y1 + disty3;
      objectToBeDrawn[clickedIndex].y4 = objectToBeDrawn[clickedIndex].y1 + disty4;
      rerender();
    });
    
    let rotate = document.getElementById("rotate");
    rotate.addEventListener("input", function (e) {
      e.preventDefault();
      let degree = rotate.value * Math.PI /180;
      let startx1 = objectToBeDrawn[clickedIndex].x1;
      let starty1 = objectToBeDrawn[clickedIndex].y1;
      let startx2 = objectToBeDrawn[clickedIndex].x2;
      let starty2 = objectToBeDrawn[clickedIndex].y2;
      let startx3 = objectToBeDrawn[clickedIndex].x3;
      let starty3 = objectToBeDrawn[clickedIndex].y3;
      let startx4 = objectToBeDrawn[clickedIndex].x4;
      let starty4 = objectToBeDrawn[clickedIndex].y4;
      let centerx = (Math.max(startx1, startx2, startx3, startx4) + Math.min(startx1, startx2, startx3, startx4))/2;
      let centery = (Math.max(starty1, starty2, starty3, starty4) + Math.min(starty1, starty2, starty3, starty4))/2;
      console.log("Center", {"x": centerx, "y": centery});
      
      // x' = x cos B - y sin B
      // y' = X sin B + y cos B
      // z = z

      let tempx1 = startx1-centerx;
      let tempy1 = starty1-centery;
      let tempx2 = startx2-centerx;
      let tempy2 = starty2-centery;
      let tempx3 = startx3-centerx;
      let tempy3 = starty3-centery;
      let tempx4 = startx4-centerx;
      let tempy4 = starty4-centery;


      let x1 = (tempx1 * Math.cos(degree) - tempy1 * Math.sin(degree));
      let y1 = (tempx1 * Math.sin(degree) + tempy1 * Math.cos(degree));
      let x2 = (tempx2 * Math.cos(degree) - tempy2 * Math.sin(degree));
      let y2 = (tempx2 * Math.sin(degree) + tempy2 * Math.cos(degree));
      let x3 = (tempx3 * Math.cos(degree) - tempy3 * Math.sin(degree));
      let y3 = (tempx3 * Math.sin(degree) + tempy3 * Math.cos(degree));
      let x4 = (tempx4 * Math.cos(degree) - tempy4 * Math.sin(degree));
      let y4 = (tempx4 * Math.sin(degree) + tempy4 * Math.cos(degree));

      objectToBeDrawn[clickedIndex].x1 = x1 + centerx;
      objectToBeDrawn[clickedIndex].y1 = y1 + centery;
      objectToBeDrawn[clickedIndex].x2 = x2 + centerx;
      objectToBeDrawn[clickedIndex].y2 = y2 + centery;
      objectToBeDrawn[clickedIndex].x3 = x3 + centerx;
      objectToBeDrawn[clickedIndex].y3 = y3 + centery;
      objectToBeDrawn[clickedIndex].x4 = x4 + centerx;
      objectToBeDrawn[clickedIndex].y4 = y4 + centery;
      objectToBeDrawn[clickedIndex].degree = rotate.value

      rerender();
    });
  }
}

// handle keyboard event
document.addEventListener("keydown", function (e) {
  if (e.key == "Escape") {
    cancelDrawing();
    // drawItem value to none
    drawItem.value = "none";
    rerender();
  }
  // stop drawing polygon on enter
  if (e.key == "Enter") {
    if (drawItem.value == "polygon" && verticesDrawn != 0) {
      if (verticesDrawn > 2) {
        finishDrawing();
      } else {
        cancelDrawing();
      }

      // drawItem value to none
      drawItem.value = "none";
      verticesDrawn = 0;

      rerender();
      updateObjectList();
    }
  }
});

// main
setBackground("#000000", 0);

// createPoint(0.4, 0.0);
// createPoint(0.8, 0.0, "#FFFF00");
// createLine(0.4, 0.0, 0.8, 0.0);

// createPolygon([
//   [-0.5, -0.5],
//   [0.5, -0.5],
//   [-0.5, 0.5],
//   [0.5, 0.5],
// ]);

let tempPoints = [
  [0.314921875, 0.1],
  [0.444921875, -0.032],
  [0.3732552083333333, -0.19],
  [0.214921875, -0.208],
  [0.06658854166666667, -0.124],
];
// for (let i = 0; i < tempPoints.length; i++) {
//   createPoint(tempPoints[i][0], tempPoints[i][1]);
// }
createPolygon(tempPoints);


// rectangle
let points = [ 0.2, 0.2, 0.2, -0.2, -0.2, -0.2];
// rectangle(points, "#FFFF00");

triangle(points, "#FFFF00")

// update canvas
rerender();

// update object list
updateObjectList();
