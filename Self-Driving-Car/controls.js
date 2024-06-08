class Controls {
    // Constructor function to initialize the controls
    constructor(type) {
        // Initialize the control flags to false
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;

        // Switch on the type of controls specified
        switch (type) {
            // If the type is "KEYS", add keyboard listeners to update the control flags
            case "KEYS":
                this.#addKeyboardListeners();
                break;
            // If the type is "DUMMY", set the forward control flag to true
            case "DUMMY":
                this.forward = true;
                break;
        }
    }

    // Method to add keyboard listeners that update the control flags when the corresponding keys are pressed or released
    #addKeyboardListeners() {
        // Set an event listener for the "keydown" event that updates the control flags based on the key pressed
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
            }
        }

        // Set an event listener for the "keyup" event that updates the control flags based on the key released
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
        }
    }
}