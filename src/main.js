import { createCanvas, rerender, cancelDrawing, createPoint, setBackground, finishDrawing, createPolygon, createLine, objectToBeDrawn, objectBeingDrawn } from "./mainInterface.js";
import { getXY } from "./utils.js";
import { convexHull, removeUnusedPoints, triangulate } from "./polygonHelper.js";
import { rectangle, triangle } from "./helper.js"

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
  console.log({x, y})

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
        verticesDrawn++;
      } else if (verticesDrawn == 3) {
        objectBeingDrawn.x4 = x;
        objectBeingDrawn.y4 = y;
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
