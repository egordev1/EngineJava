# Pure JavaScript Game Engine

This is a lightweight game engine built with vanilla JavaScript. No external libraries are required.

## Features

- Game object management
- Input handling (keyboard and mouse)
- Collision detection
- Basic game objects (rectangles, circles, text, sprites)
- Update and render loop with delta time
- Player controller component

## Classes

### GameEngine
The main game engine class that manages the game loop, input, and game objects.

**Constructor:**
```javascript
new GameEngine(canvasId, width = 800, height = 600)
```

**Methods:**
- `addObject(gameObject)` - Add a game object to the engine
- `removeObject(gameObject)` - Remove a game object from the engine
- `start()` - Start the game loop
- `stop()` - Stop the game loop
- `isKeyPressed(key)` - Check if a key is pressed
- `checkCollision(rect1, rect2)` - Check collision between two rectangles

### GameObject
Base class for all game objects.

### Rectangle
A rectangle game object.
```javascript
new Rectangle(x, y, width, height, color)
```

### Circle
A circle game object.
```javascript
new Circle(x, y, radius, color)
```

### TextObject
A text display object.
```javascript
new TextObject(x, y, text, fontSize, color, fontFamily)
```

### Sprite
An image-based game object.
```javascript
new Sprite(x, y, imageUrl)
```

### PlayerController
A component to handle player movement.
```javascript
new PlayerController(speed)
```

## Usage

1. Create an HTML file with a canvas element:
```html
<canvas id="gameCanvas" width="800" height="600"></canvas>
```

2. Include the JavaScript game engine:
```html
<script src="JavaScriptGameEngine.js"></script>
```

3. Initialize the engine and create game objects:
```javascript
const engine = new GameEngine('gameCanvas', 800, 600);

// Create a player
const player = new Rectangle(100, 100, 50, 50, '#2ecc71');
const playerController = new PlayerController(300);
player.update = function(deltaTime, engine) {
    playerController.update(deltaTime, this, engine);
};
engine.addObject(player);

// Start the game
engine.start();
```

## Example

Check the `index.html` file for a complete example demonstrating various features of the engine.