/*
 * Pure JavaScript Game Engine
 * A lightweight game engine built with vanilla JavaScript
 * No external libraries required
 */

class GameEngine {
    constructor(canvasId, width = 800, height = 600) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.gameObjects = [];
        this.running = false;
        this.lastTime = 0;
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, pressed: false };
        
        this.setupInputHandlers();
    }
    
    setupInputHandlers() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.pressed = true;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
    }
    
    addObject(gameObject) {
        this.gameObjects.push(gameObject);
        gameObject.engine = this;
    }
    
    removeObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }
    
    clearObjects() {
        this.gameObjects = [];
    }
    
    update(deltaTime) {
        // Update all game objects
        for (let i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].update) {
                this.gameObjects[i].update(deltaTime, this);
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render all game objects
        for (let i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].render) {
                this.gameObjects[i].render(this.ctx);
            }
        }
    }
    
    gameLoop(currentTime) {
        if (!this.running) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    stop() {
        this.running = false;
    }
    
    // Utility methods
    isKeyPressed(key) {
        return !!this.keys[key];
    }
    
    isMousePressed() {
        return this.mouse.pressed;
    }
    
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    // Collision detection
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
}

// Base GameObject class
class GameObject {
    constructor(x = 0, y = 0, width = 50, height = 50) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = 0;
        this.visible = true;
        this.active = true;
        this.engine = null;
    }
    
    update(deltaTime, engine) {
        // Override in subclasses
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Draw a default rectangle
        ctx.fillStyle = '#3498db';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
    
    // Get collision rectangle
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Sprite class for images
class Sprite extends GameObject {
    constructor(x, y, imageUrl) {
        super(x, y);
        this.image = new Image();
        this.image.src = imageUrl;
        this.loaded = false;
        
        this.image.onload = () => {
            this.width = this.image.width;
            this.height = this.image.height;
            this.loaded = true;
        };
    }
    
    render(ctx) {
        if (!this.visible || !this.loaded) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2);
        ctx.restore();
    }
}

// Text class for displaying text
class TextObject extends GameObject {
    constructor(x, y, text, fontSize = 16, color = '#ffffff', fontFamily = 'Arial') {
        super(x, y);
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
        this.fontFamily = fontFamily;
        this.width = 0;
        this.height = fontSize;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y + this.fontSize);
        ctx.restore();
    }
    
    // Update width based on text
    updateText(newText) {
        this.text = newText;
        const ctx = this.engine.ctx;
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.width = ctx.measureText(this.text).width;
    }
}

// Rectangle class with custom color
class Rectangle extends GameObject {
    constructor(x, y, width, height, color = '#3498db') {
        super(x, y, width, height);
        this.color = color;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

// Circle class
class Circle extends GameObject {
    constructor(x, y, radius, color = '#e74c3c') {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
        this.color = color;
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Player controller component
class PlayerController {
    constructor(speed = 200) {
        this.speed = speed;
    }
    
    update(deltaTime, object, engine) {
        if (engine.isKeyPressed('ArrowLeft') || engine.isKeyPressed('a')) {
            object.x -= this.speed * deltaTime;
        }
        if (engine.isKeyPressed('ArrowRight') || engine.isKeyPressed('d')) {
            object.x += this.speed * deltaTime;
        }
        if (engine.isKeyPressed('ArrowUp') || engine.isKeyPressed('w')) {
            object.y -= this.speed * deltaTime;
        }
        if (engine.isKeyPressed('ArrowDown') || engine.isKeyPressed('s')) {
            object.y += this.speed * deltaTime;
        }
    }
}

// Example usage:
/*
// HTML: <canvas id="gameCanvas"></canvas>
const engine = new GameEngine('gameCanvas', 800, 600);

// Create a player
const player = new Rectangle(100, 100, 50, 50, '#2ecc71');
const playerController = new PlayerController(300);
player.update = function(deltaTime, engine) {
    playerController.update(deltaTime, this, engine);
};
engine.addObject(player);

// Create an enemy
const enemy = new Circle(400, 300, 25, '#e74c3c');
engine.addObject(enemy);

// Add some text
const scoreText = new TextObject(10, 30, 'Score: 0', 24, '#ffffff');
engine.addObject(scoreText);

// Start the game
engine.start();
*/