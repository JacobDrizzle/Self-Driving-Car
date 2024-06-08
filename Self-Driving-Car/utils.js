// This is a utility function that calculates a linear interpolation between two values "A" and "B",
// using a coefficient "t" that ranges from 0 to 1.
function lerp(A, B, t) {
    // Return the interpolated value.
    return A + (B - A) * t;
}

// This is a utility function that takes in two pairs of coordinates "A" and "B", and "C" and "D",
// and returns the intersection point between the two lines defined by these coordinates, if it exists.
function getIntersection(A, B, C, D) {
    // Calculate the numerator of the "t" parameter of the intersection point.
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    // Calculate the numerator of the "u" parameter of the intersection point.
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    // Calculate the denominator of the "t" and "u" parameters.
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    // If the denominator is not 0, calculate the intersection point.
    if (bottom != 0) {
        // Calculate the "t" and "u" parameters.
        const t = tTop / bottom;
        const u = uTop / bottom;
        // If the "t" and "u" parameters are within their valid range (0 to 1), return the intersection point.
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            }
        }
    }

    // If the denominator is 0 or the "t" and "u" parameters are out of range, return "null" (no intersection).
    return null;
}

// This is a utility function that takes in two arrays of coordinates "poly1" and "poly2",
// representing two polygons, and returns "true" if the polygons intersect, and "false" otherwise.
function polysIntersect(poly1, poly2) {
    // Loop through each pair of adjacent coordinates in "poly1".
    for (let i = 0; i < poly1.length; i++) {
        // Loop through each pair of adjacent coordinates in "poly2".
        for (let j = 0; j < poly2.length; j++) {
            // Check if the line segments defined by the current pairs of coordinates intersect.
            const touch = getIntersection(
                poly1[i],
                poly1[(i + 1) % poly1.length],
                poly2[j],
                poly2[(j + 1) % poly2.length]
            );
            // If there is an intersection, return "true".
            if (touch) {
                return true;
            }
        }
    }
    // If there are no intersections, return "false".
    return false;
}

// This is a utility function that takes in a value and returns a string representation of an RGBA color.
// The alpha channel of the color is determined by the absolute value of the input value,
// and the red and blue channels are determined by the sign of the input value.
function getRGBA(value) {
    // Calculate the alpha channel of the color.
    const alpha = Math.abs(value);
    // Set the red channel to 255 if the value is positive, or 0 if the value is negative.
    const R = value < 0 ? 0 : 255;
    // Set the green channel to the same value as the red channel.
    const G = R;
    // Set the blue channel to 255 if the value is negative, or 0 if the value is positive.
    const B = value > 0 ? 0 : 255;
    // Return the RGBA color as a string.
    return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

// This is a utility function that returns a random color as a string in the HSL color space.
function getRandomColor() {
    // Generate a random hue value within a range from 290 to 550.
    const hue = 290 + Math.random() * 260;
    // Return the HSL color as a string.
    return "hsl(" + hue + ", 100%, 60%)";
}
