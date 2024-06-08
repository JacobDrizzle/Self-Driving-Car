class Sensor {
    // The constructor function is called when a new instance of the Sensor class is created.
    // It takes in a "car" object as an argument.
    constructor(car) {
        // Set the "car" property of the new Sensor object to the given car object.
        this.car = car;
        // Set the number of rays to 5 and the length of each ray to 150.
        this.rayCount = 5;
        this.rayLength = 150;
        // Set the spread of the rays to be half of a full circle (90 degrees).
        this.raySpread = Math.PI / 2;

        // Initialize the "rays" and "readings" properties of the Sensor object as empty arrays.
        this.rays = [];
        this.readings = [];
    }

    // This is a method of the Sensor class that takes in an array of road borders and an array of traffic as arguments.
    update(roadBorders, traffic) {
        // Cast the rays for the sensor.
        this.#castRays();
        // Reset the "readings" property of the Sensor object to an empty array.
        this.readings = [];
        // Loop through each ray in the "rays" property of the Sensor object.
        for (let i = 0; i < this.rays.length; i++) {
            // Calculate the reading for the current ray.
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic
                )
            );
        }
    }

    // This is a private method of the Sensor class that takes in a ray (represented as a pair of points), an array of road borders, and an array of traffic as arguments.
    #getReading(ray, roadBorders, traffic) {
        // Initialize an array to store the points where the ray touches a border or traffic object.
        let touches = [];

        // Loop through each pair of points in the "roadBorders" array.
        for (let i = 0; i < roadBorders.length; i++) {
            // Calculate the point where the ray intersects the current border.
            // If there is no intersection, "touch" will be "null".
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            // If there is an intersection, add the intersection point to the "touches" array.
            if (touch) {
                touches.push(touch);
            }
        }

        // Loop through each traffic object in the "traffic" array.
        for (let i = 0; i < traffic.length; i++) {
            // Get the polygon representing the shape of the traffic object.
            const poly = traffic[i].polygon;
            // Loop through each pair of adjacent points in the polygon.
            for (let j = 0; j < poly.length; j++) {
                // Calculate the point where the ray intersects the current border of the polygon.
                // If there is no intersection, "value" will be "null".
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                );
                // If there is an intersection, add the intersection point to the "touches" array.
                if (value) {
                    touches.push(value);
                }
            }
        }

        // If there are no points where the ray touches a border or traffic object, return "null".
        if (touches.length == 0) {
            return null;
        } else {
            // Calculate the "offset" of each touch point (the distance from the sensor's position to the touch point).
            const offsets = touches.map(e => e.offset);
            // Find the touch point with the minimum offset.
            const minOffset = Math.min(...offsets);
            // Return the touch point with the minimum offset.
            return touches.find(e => e.offset == minOffset);
        }
    }


    // This is a private method of the Sensor class.
    #castRays() {
        // Reset the "rays" property of the Sensor object to an empty array.
        this.rays = [];
        // Loop through each ray.
        for (let i = 0; i < this.rayCount; i++) {
            // Calculate the angle of the current ray.
            // The angle is a value between "this.raySpread / 2" and "-this.raySpread / 2",
            // depending on the index of the ray and the number of rays.
            // If there is only one ray, the angle will be 0.
            // If there are more than one ray, the angle will be evenly distributed between the spread limits.
            // The final angle is adjusted by the angle of the car.
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;

            // Calculate the starting point of the ray at the position of the car.
            const start = { x: this.car.x, y: this.car.y };
            // Calculate the ending point of the ray at a distance of "this.rayLength" from the starting point,
            // in the direction determined by the angle of the ray.
            const end = {
                x: this.car.x -
                    Math.sin(rayAngle) * this.rayLength,
                y: this.car.y -
                    Math.cos(rayAngle) * this.rayLength
            };
            // Add the starting and ending points of the ray to the "rays" property of the Sensor object.
            this.rays.push([start, end]);
        }
    }

    // This is a method of the Sensor class that takes in a canvas context as an argument.
    draw(ctx) {
        // Loop through each ray in the "rays" property of the Sensor object.
        for (let i = 0; i < this.rayCount; i++) {
            // Set the ending point of the ray to the default ending point stored in the "rays" property.
            let end = this.rays[i][1];
            // If there is a reading for the current ray, use the reading as the ending point of the ray.
            if (this.readings[i]) {
                end = this.readings[i];
            }

            // Draw the ray in yellow.
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            // Draw a line from the default ending point to the actual ending point in black.
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}