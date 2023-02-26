function isTopLeft(x1, y1, x2, y2, x4, y4) {
  return (x1 == x2 && y1 > y2 && x1 < x4) || (x1 == x4 && y1 > y4 && x1 < x2);
}

function isTopRight(x1, y1, x2, y2, x4, y4) {
  return (x1 == x2 && y1 > y2 && x1 > x4) || (x1 == x4 && y1 > y4 && x1 > x2);
}

function isBottomLeft(x1, y1, x2, y2, x4, y4) {
  return (x1 == x2 && y1 < y2 && x1 < x4) || (x1 == x4 && y1 < y4 && x1 < x2);
}

function isBottomRight(x1, y1, x2, y2, x4, y4) {
  return (x1 == x2 && y1 < y2 && x1 > x4) || (x1 == x4 && y1 < y4 && x1 > x2);
}

function resizeSquare(x, y, x1, y1, x2, y2, x4, y4) {
  // var length = Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
  var lengthx = Math.abs(x1 - x);
  var lengthy = Math.abs(y1 - y);
  var length = Math.min(lengthx, lengthy);
  var x1t = x1;
  var y1t = y1;
  var x2t = x2;
  var y2t = y2;
  var x4t = x4;
  var y4t = y4;

  if (isTopLeft(x1, y1, x2, y2, x4, y4)) {
    if (x > x1 && y < y1) {
      x1t = x1 + length;
      y1t = y1 - length;

      if (x2 > x1) {
        y2t = y2 - length;
        x4t = x4 + length;
      } else {
        y4t = y4 - length;
        x2t = x2 + length;
      }
    } else {
      x1t = x1 - length;
      y1t = y1 + length;

      if (x2 > x1) {
        y2t = y2 + length;
        x4t = x4 - length;
      } else {
        y4t = y4 + length;
        x2t = x2 - length;
      }
    }
  } else if (isTopRight(x1, y1, x2, y2, x4, y4)) {
    if (x < x1 && y < y1) {
      x1t = x1 - length;
      y1t = y1 - length;

      if (x1 > x2) {
        y2t = y2 - length;
        x4t = x4 - length;
      } else {
        y4t = y4 - length;
        x2t = x2 - length;
      }
    } else {
      x1t = x1 + length;
      y1t = y1 + length;

      if (x1 > x2) {
        y2t = y2 + length;
        x4t = x4 + length;
      } else {
        y4t = y4 + length;
        x2t = x2 + length;
      }
    }
  } else if (isBottomLeft(x1, y1, x2, y2, x4, y4)) {
    if (x > x1 && y > y1) {
      x1t = x1 + length;
      y1t = y1 + length;

      if (x2 > x1) {
        y2t = y2 + length;
        x4t = x4 + length;
      } else {
        y4t = y4 + length;
        x2t = x2 + length;
      }
    } else {
      x1t = x1 - length;
      y1t = y1 - length;

      if (x2 > x1) {
        y2t = y2 - length;
        x4t = x4 - length;
      } else {
        y4t = y4 - length;
        x2t = x2 - length;
      }
    }
  } else if (isBottomRight(x1, y1, x2, y2, x4, y4)) {
    if (x < x1 && y > y1) {
      x1t = x1 - length;
      y1t = y1 + length;

      if (x1 > x2) {
        y2t = y2 + length;
        x4t = x4 - length;
      } else {
        y4t = y4 + length;
        x2t = x2 - length;
      }
    } else {
      x1t = x1 + length;
      y1t = y1 - length;

      if (x1 > x2) {
        y2t = y2 - length;
        x4t = x4 + length;
      } else {
        y4t = y4 - length;
        x2t = x2 + length;
      }
    }
  } else {
    console.log("Not a square");
  }
  var result = [x1t, y1t, x2t, y2t, x4t, y4t];
  return result;
}

export { resizeSquare };
