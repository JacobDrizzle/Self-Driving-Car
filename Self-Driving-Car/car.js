class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 1, color = "blue") {
        // Initialize the car's position and dimensions
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Initialize the car's speed and acceleration
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;

        // Initialize the car's angle of rotation
        this.angle = 0;

        // Initialize a flag indicating whether the car is damaged or not
        this.damaged = false;

        // Set a flag indicating whether the car is controlled by an AI or not
        this.useBrain = controlType == "AI";

        // If the car is not a dummy (i.e. it is either AI-controlled or player-controlled), create a sensor and brain for it
        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4]
            );
        }
        // Set the controls property to a new instance of the Controls class
        this.controls = new Controls(controlType);

        // Set the img property to a new image object with a specified src
        this.img = new Image();
        this.img.src = "car.png"

        // Set the mask property to a new canvas element with the specified width and height
        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        // Get the 2D context of the mask canvas
        const maskCtx = this.mask.getContext("2d");
        // Set the onload event for the img object to draw the image on the canvas with a specified color mask
        this.img.onload = () => {
            // Set the fill style of the canvas context to the specified color
            maskCtx.fillStyle = color;
            // Draw a rectangle on the canvas using the fill style
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            // Set the global composite operation of the canvas context to "destination-atop"
            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }
    }

    update(roadBorders, traffic) {
        // If the car is not damaged
        if (!this.damaged) {
            // Move the car
            this.#move();

            // Create a polygon representation of the car
            this.polygon = this.#createPolygon();

            // Check if the car has been damaged
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        // If the car has a sensor
        if (this.sensor) {
            // Update the sensor
            this.sensor.update(roadBorders, traffic);

            // Map the sensor readings to offsets
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );

            // Feed the offsets into the car's neural network
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            // If the car should use its brain to control its movements
            if (this.useBrain) {
                // Set the control values based on the neural network outputs
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        // Loop through the road borders
        for (let i = 0; i < roadBorders.length; i++) {
            // If the car's polygon intersects with the current road border
            if (polysIntersect(this.polygon, roadBorders[i])) {
                // Return true, indicating that the car has been damaged
                return true;
            }
        }
        // Loop through the traffic
        for (let i = 0; i < traffic.length; i++) {
            // If the car's polygon intersects with the current traffic object's polygon
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                // Return true, indicating that the car has been damaged
                return true;
            }
        }
        // If the car's polygon does not intersect with any road borders or traffic objects, return false
        return false;
    }

    #createPolygon() {
        // Initialize an empty array to store the points of the polygon
        const points = [];

        // Calculate the radius of the bounding circle of the car image
        const rad = Math.hypot(this.width, this.height) / 2;

        // Calculate the angle between the center of the bounding circle and the endpoints of the car image's diagonal
        const alpha = Math.atan2(this.width, this.height);

        // Add the first point of the polygon at the top left corner of the car image
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });

        // Add the second point of the polygon at the top right corner of the car image
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });

        // Add the third point of the polygon at the bottom left corner of the car image
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });

        // Add the fourth point of the polygon at the bottom right corner of the car image
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        // Return the points of the polygon
        return points;
    }

    #move() {
        // If the forward control is active, increase the speed of the car
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }

        // If the reverse control is active, decrease the speed of the car
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        // If the speed of the car is greater than the maximum speed, set the speed to the maximum speed
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        // If the speed of the car is less than half of the maximum speed in the reverse direction, set the speed to that value
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        // If the speed of the car is greater than 0, decrease the speed by the friction value
        if (this.speed > 0) {
            this.speed -= this.friction;
        }

        // If the speed of the car is less than 0, increase the speed by the friction value
        if (this.speed < 0) {
            this.speed += this.friction;
        }

        // If the absolute value of the speed is less than the friction value, set the speed to 0
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        // If the speed is not 0
        if (this.speed != 0) {
            // Determine the direction of the car (1 for forward, -1 for reverse)
            const flip = this.speed > 0 ? 1 : -1;

            // If the left control is active, turn the car left
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }

            // If the right control is active, turn the car right
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        // Update the x and y position of the car based on its angle and speed
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }


    draw(ctx, drawSensor = false) {
        // If the car has a sensor and the drawSensor flag is true, draw the sensor
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }

        // Save the current canvas state
        ctx.save();

        // Translate the canvas to the position of the car
        ctx.translate(this.x, this.y);

        // Rotate the canvas by the negative angle of the car
        ctx.rotate(-this.angle);

        // If the car is not damaged, draw the mask image on the canvas
        if (!this.damaged) {
            ctx.drawImage(this.mask,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height);

            // Set the global composite operation to "multiply"
            ctx.globalCompositeOperation = "multiply";
        }

        // Draw the car image on the canvas
        ctx.drawImage(this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height);

        // Restore the canvas state
        ctx.restore();
    }
}