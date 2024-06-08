class Road {
    // The constructor function is called when a new instance of the Road class is created.
    // It takes in three arguments: the x-coordinate of the road, the width of the road, and the number of lanes.
    // The number of lanes is optional and defaults to 3 if not provided.
    constructor(x, width, laneCount = 3) {
        // Set the x, width, and laneCount properties of the new Road object to the corresponding arguments.
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        // Calculate the left and right boundaries of the road using the x-coordinate and width.
        this.left = x - width / 2;
        this.right = x + width / 2;

        // Set the top and bottom boundaries of the road to "infinity" (a very large number).
        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;

        // Create objects representing the top left, top right, bottom left, and bottom right corners of the road.
        const topLeft = { x: this.left, y: this.top };
        const topRight = { x: this.right, y: this.top };
        const bottomLeft = { x: this.left, y: this.bottom };
        const bottomRight = { x: this.right, y: this.bottom };

        // Set the "borders" property of the Road object to an array of pairs of points representing the top and bottom borders of the road.
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    // This is a method of the Road class that takes in a lane index as an argument.
    getLaneCenter(laneIndex) {
        // Calculate the width of a single lane based on the width of the road and the number of lanes.
        const laneWidth = this.width / this.laneCount;
        // Return the x-coordinate of the center of the specified lane.
        return this.left + laneWidth / 2 +
            Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    // This is a method of the Road class that takes in a canvas context as an argument.
    draw(ctx) {
        // Set the line width and stroke style for drawing the road.
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // Loop through each lane except the last one.
        for (let i = 1; i <= this.laneCount - 1; i++) {
            // Calculate the x-coordinate of the vertical line that separates the current lane from the next lane.
            const x = lerp(
                this.left,
                this.right,
                i / this.laneCount
            );

            // Set the line dash pattern for drawing the vertical line.
            ctx.setLineDash([20, 20]);
            // Begin a new path for drawing the line.
            ctx.beginPath();
            // Move the pen to the top of the line.
            ctx.moveTo(x, this.top);
            // Draw the line to the bottom of the road.
            ctx.lineTo(x, this.bottom);
            // Stroke the path to draw the line.
            ctx.stroke();
        }

        // Reset the line dash pattern.
        ctx.setLineDash([]);
        // Loop through each pair of points in the "borders" property of the Road object.
        this.borders.forEach(border => {
            // Begin a new path for drawing a border.
            ctx.beginPath();
            // Move the pen to the starting point of the border.
            ctx.moveTo(border[0].x, border[0].y);
            // Draw the border to the ending point.
            ctx.lineTo(border[1].x, border[1].y);
            // Stroke the path to draw the border.
            ctx.stroke();
        });
    }
}