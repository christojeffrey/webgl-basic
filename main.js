import { createCanvas, point, background } from "./helper.js";

/*============== Creating a canvas ====================*/
createCanvas(500, 500);
background(128, 128, 128, 1.0);

/*======== Defining and storing the geometry ===========*/
point(0.0, 0.0, 0.0);
point(0.8, 0.0, 0.0);
point(0.8, 0.5, 0.0);
point(0.8, -0.3, 0.0);
point(0.8, -0.5, 0.0);
point(0.8, -0.8, 0.0);

/*============= Drawing the primitive ===============*/
