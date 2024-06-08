const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

// Get the 2D rendering contexts for the car and network canvases
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

// Create a new Road object with its center at the middle of the car canvas and its width set to 90% of the car canvas width
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

// Generate an array of Car objects
const N = 10;
const cars = generateCars(N);

// Set the best car to the first element of the cars array
let bestCar = cars[0];

// If a "bestBrain" item is present in local storage, use it to create a new neural network for each car in the cars array (except the first one)
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if (i != 0) {
            // Mutate the neural networks of the other cars with a mutation rate of 10%
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}
// Set the spawn rate for new traffic cars (in milliseconds).
const SPAWN_RATE = 1000;

// Set the maximum number of traffic cars on the screen at any given time.
const MAX_TRAFFIC = 6;
// Create an array of traffic cars that the player's car must avoid
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 0, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 0, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 0, getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 0, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 0, getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 0, getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 0, getRandomColor()),
];
// Initialize a timer for spawning new traffic cars.
let spawnTimer = 0;

// Initialize the game loop.
function mainLoop(timestamp) {
    // Update the spawn timer.
    spawnTimer += timestamp - lastFrameTime;

    // If the spawn timer has reached the spawn rate and there are fewer than the maximum number of traffic cars on the screen,
    // create a new traffic car and reset the spawn timer.
    if (spawnTimer >= SPAWN_RATE && traffic.length < MAX_TRAFFIC) {
        traffic.push(
            new Car(
                road.getLaneCenter(getRandomInt(0, 2)), // Random lane
                -100, // Start off screen
                30, // Width
                50, // Height
                "DUMMY", // Dummy network
                2, // Speed
                getRandomColor() // Random color
            )
        );
        spawnTimer = 0;
    }

    // Clear the canvas.
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw the road.
    road.draw(ctx);

    // Update and draw the player's car.
    player.update();
    player.draw(ctx);

    // Update and draw the traffic cars.
    for (const car of traffic) {
        car.update();
        car.draw(ctx);
    }

    // Draw the score.
    ctx.font = "48px sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(score.toString(), 20, 50);

    // Update the last frame time.
    lastFrameTime = timestamp;

    // Request the next frame of the game loop.
    requestAnimationFrame(mainLoop);
}

// Start the game loop.
let lastFrameTime = 0;
requestAnimationFrame(mainLoop);

// Start the simulation
animate();

function update() {
    // Check if the traffic array is empty.
    if (traffic.length == 0) {
        // Create a new traffic object and add it to the array.
        traffic.push(new Traffic(road, 0, car.speed));
    }

    // Update the car and the traffic objects.
    car.update();
    traffic.forEach(e => e.update());
    // ...
}

// Save the neural network of the best car to local storage under the "bestBrain" item
function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

// Remove the "bestBrain" item from local storage
function discard() {
    localStorage.removeItem("bestBrain");
}

// Generate an array of Car objects
function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        // Create a new Car object and place it in the center lane of the road
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

// Animate the simulation
function animate(time) {
    // Update the position and status of the traffic cars
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    // Update the position and status of the player's cars
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    // Find the car that has navigated the farthest distance without crashing
    bestCar = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        ));

    // Set the height of the car and network canvases to the height of the window
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    // Save the current state of the car context and translate it to focus on the best car
    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    // Draw the road and traffic cars on the car canvas
    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }

    // Draw the player's cars on the car canvas with reduced opacity
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }

    // Draw the best car on the car canvas with full opacity
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, true);

    // Restore the original state of the car context
    carCtx.restore();

    // Set the dash offset of the network context's line dash and draw the neural network of the best car on the network canvas
    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    // Request the next frame of the animation
    requestAnimationFrame(animate);
}