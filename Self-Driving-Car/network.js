class NeuralNetwork {
    // Constructor function to initialize the network with the given number of neurons per level
    constructor(neuronCounts) {
        // Initialize the levels array
        this.levels = [];
        // For each level except the last
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            // Create a new level with the number of neurons in this level and the next level
            this.levels.push(new Level(
                neuronCounts[i], neuronCounts[i + 1]
            ));
        }
    }

    // Static method to feed the given inputs through the given network and return the outputs
    static feedForward(givenInputs, network) {
        // Feed the given inputs through the first level of the network and store the outputs
        let outputs = Level.feedForward(
            givenInputs, network.levels[0]);
        // For each remaining level of the network
        for (let i = 1; i < network.levels.length; i++) {
            // Feed the outputs of the previous level through this level and store the new outputs
            outputs = Level.feedForward(
                outputs, network.levels[i]);
        }
        // Return the final outputs of the network
        return outputs;
    }

    // Static method to mutate the given network by a given amount
    static mutate(network, amount = 1) {
        // For each level in the network
        network.levels.forEach(level => {
            // For each bias in the level
            for (let i = 0; i < level.biases.length; i++) {
                // Mutate the bias by interpolating between the current value and a random value between -1 and 1 by the given amount
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                );
            }
            // For each weight array in the level
            for (let i = 0; i < level.weights.length; i++) {
                // For each weight in the weight array
                for (let j = 0; j < level.weights[i].length; j++) {
                    // Mutate the weight by interpolating between the current value and a random value between -1 and 1 by the given amount
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    );
                }
            }
        });
    }
}

class Level {
    // Constructor function to initialize the level with the given number of inputs and outputs
    constructor(inputCount, outputCount) {
        // Initialize the inputs array with the given number of elements
        this.inputs = new Array(inputCount);
        // Initialize the outputs array with the given number of elements
        this.outputs = new Array(outputCount);
        // Initialize the biases array with the given number of elements
        this.biases = new Array(outputCount);
        // Initialize the weights array with a nested array for each input
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }
        // Randomize the biases and weights
        Level.#randomize(this);
    }

    static #randomize(level) {
        // For each input in the level
        for (let i = 0; i < level.inputs.length; i++) {
            // For each output in the level
            for (let j = 0; j < level.outputs.length; j++) {
                // Set the weight between the input and output to a random value between -1 and 1
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }
        // For each bias in the level
        for (let i = 0; i < level.biases.length; i++) {
            // Set the bias to a random value between -1 and 1
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    // This is a static method of a class that takes in an array of inputs and an object representing a "level"
    // of a neural network as arguments.
    static feedForward(givenInputs, level) {

        // Set the "inputs" property of the "level" object to the given inputs.
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        // Loop through each output in the "outputs" property of the "level" object.
        for (let i = 0; i < level.outputs.length; i++) {
            // Initialize a sum to 0.
            let sum = 0
            // Loop through each input in the "inputs" property of the "level" object.
            for (let j = 0; j < level.inputs.length; j++) {
                // Add the product of the current input and its corresponding weight to the sum.
                sum += level.inputs[j] * level.weights[j][i];
            }

            // If the sum is greater than the current bias, set the current output to 1.
            // Otherwise, set the current output to 0.
            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        // Return the "outputs" property of the "level" object.
        return level.outputs;
    }
}