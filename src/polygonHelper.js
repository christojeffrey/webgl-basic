function triangulate(sides) {
  let iteration = 0;
  // sides = [[0,0],[100,0],[100,100],[0,100]]
  // deep copy the sides

  let pointsNotDrawnYet = [];
  let possiblePointsToBeDrawn = [];
  let drawnLines = [];
  let triangles = [];

  // fill possiblePointsToBeDrawn with the coordinates of the polygon
  for (let i = 0; i < sides.length; i++) {
    possiblePointsToBeDrawn.push(sides[i]);
    pointsNotDrawnYet.push(sides[i]);
  }

  let isTherePointThatIsNotInTriangle = true;
  // while there are points that is not in the triangles, keep looping
  while (isTherePointThatIsNotInTriangle) {
    iteration++;

    // fail safe
    if (iteration > 100000000) {
      console.error("iteration is too high");
      break;
    }
    let trianglePointsCandidates = [];
    // consist of possible points to be drawn
    for (let i = 0; i < possiblePointsToBeDrawn.length; i++) {
      trianglePointsCandidates.push(possiblePointsToBeDrawn[i]);
    }
    // console.log("trianglePointsCandidates before first point", trianglePointsCandidates);

    let firstPoint = pointsNotDrawnYet[0];
    // remove firstPoint from possiblePointsToBeDrawn
    trianglePointsCandidates = trianglePointsCandidates.filter((point) => point !== firstPoint);
    // get a second point, then test if it intersects with any of the lines.
    // if it does, then get another point
    // console.log("trianglePointsCandidates before second point", trianglePointsCandidates);

    let secondPoint;
    let secondPointCandidate;
    for (let i = 0; i < trianglePointsCandidates.length; i++) {
      secondPointCandidate = trianglePointsCandidates[i];
      let isIntersecting = false;
      for (let j = 0; j < drawnLines.length; j++) {
        let line = drawnLines[j];
        if (isInterescting(firstPoint[0], firstPoint[1], secondPointCandidate[0], secondPointCandidate[1], line[0][0], line[0][1], line[1][0], line[1][1])) {
          isIntersecting = true;
          break;
        }
        // check if overlapping with any points
        for (let k = 0; k < sides.length; k++) {
          if (isOverlappingAPoint(firstPoint[0], firstPoint[1], secondPointCandidate[0], secondPointCandidate[1], sides[k][0], sides[k][1])) {
            isIntersecting = true;
            break;
          }
        }
      }

      if (!isIntersecting) {
        // console.log("==FOUND SECOND POINT==", secondPointCandidate);
        secondPoint = secondPointCandidate;
        break;
      }
    }
    // if not, then add the line to the drawnLines.
    // remove secondPoint from possiblePointsToBeDrawn
    trianglePointsCandidates = trianglePointsCandidates.filter((point) => point !== secondPoint);
    drawnLines.push([firstPoint, secondPoint]);
    // continue get a third point. check if a line that is made between the first, second, and third point intersects with any of the lines.
    let thirdPoint;
    let thirdPointCandidate;
    // console.log("trianglePointsCandidates before finding the third", trianglePointsCandidates);
    for (let i = 0; i < trianglePointsCandidates.length; i++) {
      thirdPointCandidate = trianglePointsCandidates[i];
      let isIntersecting = false;
      for (let j = 0; j < drawnLines.length; j++) {
        let line = drawnLines[j];
        if (isInterescting(firstPoint[0], firstPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], line[0][0], line[0][1], line[1][0], line[1][1])) {
          // print the two intersecting lines
          // line ... is intersecting with line ...
          // console.log("line", firstPoint, thirdPointCandidate, "is intersecting with line", line[0], line[1]);
          isIntersecting = true;
          break;
        }

        if (isInterescting(secondPoint[0], secondPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], line[0][0], line[0][1], line[1][0], line[1][1])) {
          // print the two intersecting lines
          // line ... is intersecting with line ...
          // console.log("line", secondPoint, thirdPointCandidate, "is intersecting with line", line[0], line[1]);
          isIntersecting = true;
          break;
        }
        // check if overlapping with any points
        for (let k = 0; k < sides.length; k++) {
          if (isOverlappingAPoint(firstPoint[0], firstPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], sides[k][0], sides[k][1])) {
            isIntersecting = true;
            break;
          }
          if (isOverlappingAPoint(secondPoint[0], secondPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], sides[k][0], sides[k][1])) {
            isIntersecting = true;
            break;
          }
        }
      }
      if (!isIntersecting) {
        thirdPoint = thirdPointCandidate;
        // console.log("found third point", thirdPoint);
        break;
      }
    }

    // if not, then add the line to the drawnLines.
    // remove thirdPoint from trianglePointsCandidates
    trianglePointsCandidates = trianglePointsCandidates.filter((point) => point !== thirdPoint);
    // drawnLines cannot be undefined

    drawnLines.push([firstPoint, thirdPoint]);
    drawnLines.push([secondPoint, thirdPoint]);
    // console.log("new triangle == ", firstPoint, secondPoint, thirdPoint);
    // add the triangle to the triangles
    // dont push if there is undefined
    // if (firstPoint && secondPoint && thirdPoint)
    triangles.push([firstPoint, secondPoint, thirdPoint]);
    pointsNotDrawnYet = pointsNotDrawnYet.filter((point) => point !== firstPoint && point !== secondPoint && point !== thirdPoint);
    // check if there are points that is not in the triangles

    // filter drawnLines to only have unique lines
    drawnLines = drawnLines.filter((line, index) => drawnLines.findIndex((line2) => line2[0] === line[0] && line2[1] === line[1]) === index);

    // update possiblePointsToBeDrawn. if there is a point that shown twice in drawnLines, then remove it from possiblePointsToBeDrawn

    // console.log
    // console.log("==================================");
    // console.log("triangle", triangles);
    // console.log("drawnLines", drawnLines);
    // console.log("pointsNotDrawnYet", pointsNotDrawnYet);
    // console.log("possiblePointsToBeDrawn", possiblePointsToBeDrawn);

    if (pointsNotDrawnYet.length === 0) {
      isTherePointThatIsNotInTriangle = false;
    }
  }
  console.log("triangulated result from input", sides, "is", triangles);
  return triangles;
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s) and the intersection is not at the end point of a line
function isInterescting(a, b, c, d, p, q, r, s) {
  // if one of the point is the same, then it is not intersecting
  if (a === p && b === q) {
    return false;
  }
  if (a === r && b === s) {
    return false;
  }
  if (c === p && d === q) {
    return false;
  }
  if (c === r && d === s) {
    return false;
  }
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
}
// function isInterescting(x1, y1, x2, y2, x3, y3, x4, y4) {
//   // ignore if intersection is at the end point of a line
//   // check if line 1 intersects with line 2
//   // line 1: (x1, y1) to (x2, y2)
//   // line 2: (x3, y3) to (x4, y4)
//   // return true if intersecting, false if not

//   // calculate the direction of the lines
//   let d1x = x2 - x1;
//   let d1y = y2 - y1;
//   let d2x = x4 - x3;
//   let d2y = y4 - y3;

//   // calculate the cross product
//   let cross = d1x * d2y - d1y * d2x;

//   // if cross product is 0, then the lines are parallel
//   if (cross == 0) return false;

//   // calculate the point of intersection
//   let t1 = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
//   let t2 = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
//   let t = t1 / t2;

//   // calculate the x and y of the intersection point
//   let x = t * d1x;
//   let y = t * d1y;

//   // check if the x and y coordinates are within both lines
//   if (x < Math.min(x1, x2) || x > Math.max(x1, x2)) return false;
//   if (x < Math.min(x3, x4) || x > Math.max(x3, x4)) return false;

//   // ignore if intersection is at the end point of a line
//   if (x == x1 && y == y1) return false;
//   if (x == x2 && y == y2) return false;
//   if (x == x3 && y == y3) return false;
//   if (x == x4 && y == y4) return false;

//   return true;
// }
// convex hull
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
  let val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);

  if (val == 0) return 0; // collinear
  return val > 0 ? 1 : 2; // clock or counterclock wise
}

// Prints convex hull of a set of n points.
function convexHull(points) {
  let n = points.length;
  // Initialize Result
  let hull = [];

  // There must be at least 3 points
  if (n < 3) return hull;

  // Find the leftmost point
  let l = 0;
  for (let i = 1; i < n; i++) if (points[i][0] < points[l][0]) l = i;

  // Start from leftmost point, keep moving
  // counterclockwise until reach the start point
  // again. This loop runs O(h) times where h is
  // number of points in result or output.
  let p = l,
    q;
  do {
    // Add current point to result
    hull.push(points[p]);

    // Search for a point 'q' such that
    // orientation(p, q, x) is counterclockwise
    // for all points 'x'. The idea is to keep
    // track of last visited most counterclock-
    // wise point in q. If any point 'i' is more
    // counterclock-wise than q, then update q.
    q = (p + 1) % n;

    for (let i = 0; i < n; i++) {
      // If i is more counterclockwise than
      // current q, then update q
      if (orientation(points[p], points[i], points[q]) == 2) q = i;
    }

    // Now q is the most counterclockwise with
    // respect to p. Set p as q for next iteration,
    // so that q is added to result 'hull'
    p = q;
  } while (p != l); // While we don't come to first

  return hull;
}

function isOverlappingAPoint(x1, y1, x2, y2, x3, y3) {
  // console.log("--------------------");
  let flag = false;

  // return true if the line from (x1,y1)->(x2,y2) overlap with (x3,y3)

  // check if x3 y3 is somewhere on the line x1 y1 to x2 y2
  let slope1 = (y2 - y1) / (x2 - x1);
  let slope2 = (y3 - y1) / (x3 - x1);
  if (slope1 == slope2) {
    // if slope the same, then check if x3 is between x1 and x2 and y3 is between y1 and y2
    if (x3 >= Math.min(x1, x2) && x3 <= Math.max(x1, x2) && y3 >= Math.min(y1, y2) && y3 <= Math.max(y1, y2)) {
      // console.log("OVERLAP!", x1, y1, x2, y2, x3, y3);
      flag = true;
    }
  }
  // all point have to be different. if any of them are the same, return false;
  if (x1 == x2 && y1 == y2) flag = false;
  if (x1 == x3 && y1 == y3) flag = false;
  if (x2 == x3 && y2 == y3) flag = false;
  if (x3 == 0.0 && y3 == 0.5) {
    // console.log("!!!this is it, testing");
  }
  // console.log(x1, y1, x2, y2, x3, y3, flag);
  // console.log("--------------------");
  return flag;
}

function removeUnusedPoints(points) {
  // for every combination of points, check if they are overlapping
  // if isOverlappingAPoint is true, remove the point
  let newPoints = [];

  // copy the points array
  for (let i = 0; i < points.length; i++) {
    newPoints.push(points[i]);
  }
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      for (let k = 0; k < points.length; k++) {
        if (i != j && i != k && j != k) {
          if (isOverlappingAPoint(points[i][0], points[i][1], points[j][0], points[j][1], points[k][0], points[k][1])) {
            newPoints = newPoints.filter((item) => item !== points[k]);
          }
        }
      }
    }
  }
  return newPoints;
}

export { triangulate, convexHull, removeUnusedPoints };
