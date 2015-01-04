var setIntervalSynchronous = function (func, delay) {
  var intervalFunction, timeoutId, clear;
  // Call to clear the interval.
  clear = function () {
    clearTimeout(timeoutId);
  };
  intervalFunction = function () {
    func();
    timeoutId = setTimeout(intervalFunction, delay);
  }
  // Delay start.
  timeoutId = setTimeout(intervalFunction, delay);
  // You should capture the returned function for clearing.
  return clear;
};

var pfx = ["webkit", "moz", "MS", "o", ""];
function PrefixedEvent(element, type, callback) {
    for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.addEventListener(pfx[p]+type, callback, false);
    }
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

var websocket = new WebSocket("ws://localhost:8080/");
var buttonStart = document.getElementById("start");
var buttonStop = document.getElementById("stop");

var zero = {
    bg: document.getElementById("viewport"),
    el: document.getElementById("zero"),
    transformed: false,
    running: false,
    jumping: false,
    attacking: false,
    start: true,
    right: true,
    slaying: false,
    temp: 0,
    getPosX: function () {
        var style = window.getComputedStyle(this.el),
            left  = style.left,
            posX  = parseInt(left.substr(0, left.length - 2), 10);
        
        return posX;
    },
    getPosY: function () {
        var style = window.getComputedStyle(this.el),
            top   = style.top,
            posY  = parseInt(top.substr(0, top.length - 2), 10);

        return posY;
    },
    getBgPosX: function () {
        var style = window.getComputedStyle(this.bg),
            left = style.backgroundPosition,
            posX = parseInt(left.substr(0, left.length - 2), 10);

        return posX;
    },
    getBgPosY: function () {
        var style = window.getComputedStyle(this.bg),
            top = style.backgroundPosition,
            posY = parseInt(top.substr(0, top.length - 2), 10);

        return posY;
    },
    standStill: function () {
        if (this.running) {
            this.el.classList.remove("zero-run-right");
            this.el.classList.remove("zero-run-left");
            this.bg.classList.remove("zero-bg-move");
            this.el.classList.add("zero-stand");
            this.running = false;
        }
        if (this.jumping) {
            this.el.classList.remove("zero-jump-up");
            this.el.classList.remove("zero-jump-down");
            this.el.classList.add("zero-stand");
            this.jumping = false;
        }
        if (this.attacking) {
            this.el.classList.remove("zero-attack");
            this.el.classList.add("zero-stand");
            this.attacking = false;
        }
    },
    moveRight: function () {
        var posX   = this.getPosX(),
            newPos = posX + 3;
        
        if (posX > 700) {
            newPos = 700;
        }
        
        if (!this.running) {
            this.el.classList.remove("zero-stand");
            this.el.classList.add("zero-run-right");
            this.el.style.webkitAnimation = "";
            this.running = true;
        }
        
        if (this.transformed) {
            this.el.style.webkitTransform = "";
            this.transformed = !this.transformed;
        }
        
        this.el.style.left = newPos + "px";
    },
    moveLeft: function () {
        var posX   = this.getPosX(),
            newPos = posX - 3;
        
        if (posX < 0) {
            newPos = 0;
        }
        
        if (!this.running) {
            this.el.classList.remove("zero-stand");
            this.el.classList.add("zero-run-left");
            this.running = true;
        }
        
        if (!this.transformed) {
            this.el.style.webkitTransform = "rotateY(180deg)";
            this.transformed = !this.transformed;
        }
        
        this.el.style.left = newPos + "px";
    },
    moveBgRight: function() {
        var posX   = this.getBgPosX(),
            newPos = posX - 3;

        if (!this.running) {
            this.el.classList.remove("zero-stand");
            this.bg.classList.add("zero-bg-move");
            this.el.classList.add("zero-run-right");
            this.el.style.webkitAnimation = "";
            this.running = true;
        }
        
        if (this.transformed) {
            this.el.style.webkitTransform = "";
            this.transformed = !this.transformed;
        }
        
        this.bg.style.backgroundPosition = newPos + "px";
    },
    moveBgLeft: function () {
        var posX   = this.getBgPosX(),
            newPos = posX + 3;
        
        if (!this.running) {
            this.el.classList.remove("zero-stand");
            this.bg.classList.add("zero-bg-move");
            this.el.classList.add("zero-run-left");
            this.running = true;
        }
        
        if (!this.transformed) {
            this.el.style.webkitTransform = "rotateY(180deg)";
            this.transformed = !this.transformed;
        }
        
        this.bg.style.backgroundPosition = newPos + "px";
    },
    startCar: function () {
        var posX   = this.getPosX(),
            newPos = posX + 6;
        
        if (posX > 100) {
            clearInterval(intervalCarRight);
            zero.rideOut();
            zero.moveRight();
            intervalMoveRight = setInterval(function(){zero.moveRight()}, 15);
            zero.jumpUp();
            intervalUp = setInterval(function(){zero.jumpUp()}, 0);
        }
        if (this.transformed) {
            this.el.style.webkitTransform = "";
            this.transformed = !this.transformed;
        }
        
        this.el.style.left = newPos + "px";
    },
    jumpUp: function () {
        var posY   = this.getPosY(),
            newPos = posY - 5;

        if (newPos <= 160) {
            clearInterval(intervalUp);
            newPos = 160;
            intervalDown = setInterval(function(){zero.jumpDown()}, 0);
        }

        if (!this.jumping) {
            this.el.classList.remove("zero-stand");
            this.el.classList.add("zero-jump-up");
            this.jumping = true;
        }

        this.el.style.top = newPos + "px";
    },
    jumpDown: function () {
        var posY   = this.getPosY(),
            newPos = posY + 5;

        if (newPos >= 270) {
            newPos = 270;
            clearInterval(intervalDown);
            zero.standStill();
            if (zero.start) {
                zero.start = false;
                clearInterval(intervalMoveRight);
                buttonStart.style.display = "block";
                gameLoop();
            }
        }

        if (this.jumping) {
            this.el.classList.remove("zero-jump-up");
            this.el.classList.add("zero-jump-down");
            this.jumping = true;
        }

        this.el.style.top = newPos + "px";
    },
    rideStill: function() {
        this.el.classList.remove("zero-stand");
        this.el.classList.add("zero-ride-car");
        this.riding = true;
        this.el.style.width = "110px";
    },
    rideOut: function() {
        this.el.classList.remove("zero-ride-car");
        this.el.classList.add("zero-stand");
        this.riding = false;
        this.el.style.width = "55px";
    },
    attack: function() {
        zero.temp+= 1;

        if (!this.attacking) {
            this.attacking = true;
            this.el.style.width = "100px";
            this.el.style.height = "62px";
            this.el.style.top = "258px";
            this.el.classList.remove("zero-stand");
            this.el.classList.add("zero-attack");
        }

        if (!zero.right) {
            this.el.style.webkitTransform = "rotateY(180deg)";
        }

        if ((demon.getPosX() <= (zero.getPosX() + 80)) && (zero.getPosX() <= (demon.getPosX() + 35))) {
            clearInterval(intervalDemon);
            demon.die = true;
            demon.el.style.width = "45px";
            demon.el.classList.remove("demon-run-left");
            demon.el.classList.remove("demon-jump");
            demon.el.classList.remove("demon-fly");
            demon.el.classList.add("demon-die");
            demon.el.style.backgroundPosition = "-270px -100px";
        }

        if (zero.temp == 120) {
            clearInterval(intervalAtt);
            this.el.style.width = "50px";
            this.el.style.height = "50px";
            this.el.style.top = "270px";
            if (!zero.right) {
                this.el.style.left = (this.getPosX() + 50) + "px";
            }
            zero.standStill();
            gameLoop();
        }

        // PrefixedEvent(this.el, "AnimationEnd", function(){
        //     clearInterval(intervalAtt);
        //     this.style.width = "50px";
        //     this.style.height = "50px";
        //     this.style.top = "270px";
        //     zero.standStill();
        //     gameLoop();
        // });
    },
    die: function() {
        zero.standStill();

        if (!zero.right) {
            this.el.style.webkitTransform = "rotateY(180deg)";
        }

        this.el.style.width = "75px";
        if (!zero.right) {
            this.el.style.left = (this.getPosX() + 25) + "px";
        }

        this.el.classList.add("zero-die");

        this.el.style.backgroundPosition = "-750px -312px";
    }
};

var wolf = {
    el: document.getElementById("wolf"),
    transformed: false,
    running: false,
    // howling: false,
    jumping: false,
    right: true,
    getPosX: function () {
        var style = window.getComputedStyle(this.el),
            left  = style.left,
            posX  = parseInt(left.substr(0, left.length - 2), 10);
        
        return posX;
    },
    getPosY: function () {
        var style = window.getComputedStyle(this.el),
            top   = style.top,
            posY  = parseInt(top.substr(0, top.length - 2), 10);

        return posY;
    },
    standStill: function () {
        if (this.running) {
            this.el.classList.remove("wolf-run");
            this.running = false;
        }
        if (this.howl) {
            this.el.classList.remove("wolf-howl");
            this.howling = false;
        }
        this.el.classList.add("wolf-stand");
        
    },
    moveRight: function() {
        var posX = this.getPosX(),
            newPos = posX + 3;

        if (newPos > 700) {
            newPos = 700;
        }

        if (!this.running) {
            this.el.classList.remove("wolf-stand");
            this.el.classList.add("wolf-run");
            this.el.style.webkitAnimation = "";
            this.running = true;
        }
        
        if (this.transformed) {
            this.el.style.webkitTransform = "";
            this.transformed = !this.transformed;
        }

        this.el.style.left = newPos + "px";
    },
    moveLeft: function() {
        var posX = this.getPosX(),
            newPos = posX - 3;

        if (newPos < 0) {
            newPos = 0;
        }

        if (!this.running) {
            this.el.classList.remove("wolf-stand");
            this.el.classList.add("wolf-run");
            this.el.style.webkitAnimation = "";
            this.running = true;
        }
        
        if (!this.transformed) {
            this.el.style.webkitTransform = "rotateY(180deg)";
            this.transformed = !this.transformed;
        }

        this.el.style.left = newPos + "px";
    },
    moveBgRight: function () {
        if (!this.running) {
            this.el.classList.remove("wolf-stand");
            this.el.classList.add("wolf-run");
            this.el.style.webkitAnimation = "";
            this.running = true;
        }
        
        if (this.transformed) {
            this.el.style.webkitTransform = "";
            this.transformed = !this.transformed;
        }
    },
    moveBgLeft: function () {
        if (!this.running) {
            this.el.classList.remove("wolf-stand");
            this.el.classList.add("wolf-run");
            this.el.style.webkitAnimation = "";
            this.running = true;
        }
        
        if (!this.transformed) {
            this.el.style.webkitTransform = "rotateY(180deg)";
            this.transformed = !this.transformed;
        }
    },
    jump: function() {
        var posX   = this.getPosX(),
            newPos = posX + 2;

        if (!this.jumping) {
            this.el.classList.remove("wolf-stand");
            this.el.classList.add("wolf-start");
        }

        if (posX > 170) {
            newPos = 170;
            clearInterval(intervalWolfJump);
            this.el.classList.remove("wolf-start");
            this.el.classList.add("wolf-stand");
            this.jumping = false;
        }

        this.el.style.left = newPos + "px";
    },
    howl: function () {
        if (wolf.right) {
            this.el.style.webkitTransform = "rotateY(180deg)";
        }

        this.el.classList.remove("wolf-stand");
        this.el.classList.remove("wolf-run");
        this.el.style.backgroundPosition = "-150px 0px";
    }
}
// var zero2 = {
//     bg: document.getElementById("viewport"),
//     el: document.getElementById("zero"),
//     transformed: false,
//     running: false,
//     jumping: false,
//     start: true,
//     getPosX: function () {
//         var style = window.getComputedStyle(this.el),
//             left  = style.left,
//             posX  = parseInt(left.substr(0, left.length - 2), 10);
        
//         return posX;
//     },
//     getPosY: function () {
//         var style = window.getComputedStyle(this.el),
//             top   = style.top,
//             posY  = parseInt(top.substr(0, top.length - 2), 10);

//         return posY;
//     },
//     getBgPosX: function () {
//         var style = window.getComputedStyle(this.bg),
//             left = style.backgroundPosition,
//             posX = parseInt(left.substr(0, left.length - 2), 10);

//         return posX;
//     },
//     getBgPosY: function () {
//         var style = window.getComputedStyle(this.bg),
//             top = style.backgroundPosition,
//             posY = parseInt(top.substr(0, top.length - 2), 10);

//         return posY;
//     },
//     standStill: function () {
//         if (this.running) {
//             this.el.classList.remove("zero-run-right");
//             this.el.classList.remove("zero-run-left");
//             this.bg.classList.remove("zero-bg-move");
//             this.el.classList.add("zero-stand");
//             this.running = false;
//         }
//         if (this.jumping) {
//             this.el.classList.remove("zero-jump-up");
//             this.el.classList.remove("zero-jump-down");
//             this.el.classList.add("zero-stand");
//             this.jumping = false;
//         }
//     },
//     moveRight: function () {
//         var posX   = this.getPosX(),
//             newPos = posX + 3;
        
//         if (posX > 1027) {
//             newPos = 1027;
//         }
        
//         if (!this.running) {
//             this.el.classList.remove("zero-stand");
//             this.el.classList.add("zero-run-right");
//             this.el.style.webkitAnimation = "";
//             this.running = true;
//         }
        
//         if (this.transformed) {
//             this.el.style.webkitTransform = "";
//             this.transformed = !this.transformed;
//         }
        
//         this.el.style.left = newPos + "px";
//     },
//     moveLeft: function () {
//         var posX   = this.getPosX(),
//             newPos = posX - 3;
        
//         if (posX < 0) {
//             newPos = 0;
//         }
        
//         if (!this.running) {
//             this.el.classList.remove("zero-stand");
//             this.el.classList.add("zero-run-left");
//             this.running = true;
//         }
        
//         if (!this.transformed) {
//             this.el.style.webkitTransform = "rotateY(180deg)";
//             this.transformed = !this.transformed;
//         }
        
//         this.el.style.left = newPos + "px";
//     },
//     moveBgRight: function() {
//         var posX   = this.getBgPosX(),
//             newPos = posX - 3;
        
//         if (!this.running) {
//             this.el.classList.remove("zero-stand");
//             this.bg.classList.add("zero-bg-move");
//             this.el.classList.add("zero-run-right");
//             this.el.style.webkitAnimation = "";
//             this.running = true;
//         }
        
//         if (this.transformed) {
//             this.el.style.webkitTransform = "";
//             this.transformed = !this.transformed;
//         }
        
//         this.bg.style.backgroundPosition = newPos + "px";
//     },
//     moveBgLeft: function () {
//         var posX   = this.getBgPosX(),
//             newPos = posX + 3;
        
//         if (!this.running) {
//             this.el.classList.remove("zero-stand");
//             this.bg.classList.add("zero-bg-move");
//             this.el.classList.add("zero-run-left");
//             this.running = true;
//         }
        
//         if (!this.transformed) {
//             this.el.style.webkitTransform = "rotateY(180deg)";
//             this.transformed = !this.transformed;
//         }
        
//         this.bg.style.backgroundPosition = newPos + "px";
//     },
//     startCar: function () {
//         var posX   = this.getPosX(),
//             newPos = posX + 6;
        
//         if (posX > 100) {
//             clearInterval(intervalCarRight);
//             zero.rideOut();
//             zero.moveRight();
//             intervalMoveRight = setInterval(function(){zero.moveRight()}, 15);
//             zero.jumpUp();
//             intervalUp = setInterval(function(){zero.jumpUp()}, 0);
//         }
//         if (this.transformed) {
//             this.el.style.webkitTransform = "";
//             this.transformed = !this.transformed;
//         }
        
//         this.el.style.left = newPos + "px";
//     },
//     jumpUp: function () {
//         var posY   = this.getPosY(),
//             newPos = posY - 5;

//         if (newPos <= 160) {
//             clearInterval(intervalUp);
//             newPos = 160;
//             intervalDown = setInterval(function(){zero.jumpDown()}, 0);
//         }

//         if (!this.jumping) {
//             this.el.classList.remove("zero-stand");
//             this.el.classList.add("zero-jump-up");
//             this.jumping = true;
//         }

//         this.el.style.top = newPos + "px";
//     },
//     jumpDown: function () {
//         var posY   = this.getPosY(),
//             newPos = posY + 5;

//         if (newPos >= 270) {
//             newPos = 270;
//             clearInterval(intervalDown);
//             zero.standStill();
//             if (zero.start) {
//                 zero.start = false;
//                 clearInterval(intervalMoveRight);
//                 gameLoop();
//             }
//         }

//         if (this.jumping) {
//             this.el.classList.remove("zero-jump-up");
//             this.el.classList.add("zero-jump-down");
//             this.jumping = true;
//         }

//         this.el.style.top = newPos + "px";
//     },
//     rideStill: function() {
//         this.el.classList.remove("zero-stand");
//         this.el.classList.add("zero-ride-car");
//         this.riding = true;
//         this.el.style.width = "110px";
//     },
//     rideOut: function() {
//         this.el.classList.remove("zero-ride-car");
//         this.el.classList.add("zero-stand");
//         this.riding = false;
//         this.el.style.width = "55px";
//     },
//     attack: function() {
//         console.log("a");
//     }
// };

// var ProsesKeyDown = function (e) {
//     var code = e.keyCode;
    
//     switch (code) {
//     case 37:
//         zero.moveLeft();
//         break;
//     case 39:
//         zero.moveRight();
//         break;
//     case 38:
//         if(!zero.jumping) {
//             zero.jumpUp();
//             intervalUp = setInterval(function(){zero.jumpUp()}, 0);
//         }
//         break;
//     }
// };

var demon = {
    el: document.getElementById("demon"),
    running: false,
    jumping: false,
    die: false,
    getPosX: function () {
        var style = window.getComputedStyle(this.el),
            left  = style.left,
            posX  = parseInt(left.substr(0, left.length - 2), 10);
        
        return posX;
    },
    getPosY: function () {
        var style = window.getComputedStyle(this.el),
            top   = style.top,
            posY  = parseInt(top.substr(0, top.length - 2), 10);

        return posY;
    },
    moveLeft: function () {
        var posX = this.getPosX(),
            newPos = posX - 5;

        this.el.style.webkitTransform = "rotateY(180deg)";

        if (newPos <= 0) {
            newPos = 713;
        }

        if (!this.running) {
            this.el.classList.add("demon-run-left");
            this.el.style.webkitAnimation = "";
            this.running = true;
        }

        this.el.style.left = newPos + "px";
    },
    jump: function() {
        var posY = this.getPosY(),
            newPos = posY - 1;

        this.el.style.webkitTransform = "rotateY(180deg)";

        if (newPos <= 135) {
            clearInterval(intervalDemonJump);
            this.el.classList.remove("demon-jump");
            this.el.classList.add("demon-fly");
        }

        if (!this.jumping) {
            this.el.style.width = "45px";
            this.el.classList.remove("demon-run-left");
            this.el.classList.add("demon-jump");
            this.el.style.webkitAnimation = "";
            this.jumping = true;
        }

        this.el.style.top = newPos + "px";
    }
}

var ProsesKeyUp = function () {
    if (zero.jumping) {
        wolf.standStill();
        websocket.send("wolf-stand");
    }
    // else if (zero.riding) {
    //     zero.rideStill();
    // }
    else {
        zero.standStill();
        wolf.standStill();
        websocket.send("stand");
    }
};

var keyState = {};

window.addEventListener("keydown", function(e){
    keyState[e.keyCode || e.which] = true;
}, true);
window.addEventListener("keyup", function(e){
    keyState[e.keyCode || e.which] = false;
    ProsesKeyUp();
}, true);

function gameLoop() {
    // if (keyState[67]) {
    //     if (!zero.riding){
    //         zero.riding = true;
    //     } else {
    //         zero.riding = false;
    //         zero.rideOut();
    //     }
    // }
    // else {
        if ((demon.getPosX() <= (zero.getPosX() + 30)) && (zero.getPosX() <= (demon.getPosX() + 25)) && ((zero.getPosY() + 45) >= demon.getPosY()) && !demon.die) {
            zero.die();
            clearInterval(intervalDemon);
            demon.jump();
            wolf.howl();
            intervalDemonJump = setInterval(function(){demon.jump()}, 0);
            websocket.send("die");
            return;
        }

        if (zero.attacking) {
            return;
        }
        if (keyState[65]) {
            if (!zero.jumping) {
                if (!zero.right) {
                    zero.el.style.left = (zero.getPosX() - 50) + "px";
                }
                zero.temp = 0;
                intervalAtt = setInterval(function(){zero.attack()},0);
                websocket.send("attack");
            }
        }
        if (keyState[37]) {
            // if (zero.riding) {
            //     zero.rideLeft();
            // }
            // else {
                if (zero.slaying) {
                    zero.moveLeft();
                    wolf.moveLeft();
                    websocket.send("left");
                    zero.right = false;
                    wolf.right = false;
                } else {
                    zero.moveBgLeft();
                    wolf.moveBgLeft();
                    websocket.send("left");
                    zero.right = false;
                    wolf.right = false;
                }
            // }
        }
        if (keyState[38]) {
            if (!zero.jumping && !zero.riding) {
                zero.jumpUp();
                intervalUp = setInterval(function(){zero.jumpUp()}, 0);
                websocket.send("jump");
            }
        }
        if (keyState[39]) {
            // if (zero.riding) {
            //     zero.rideRight();
            // }
            // else {
                if (zero.slaying) {
                    zero.moveRight();
                    wolf.moveRight();
                    websocket.send("right");
                    zero.right = true;
                    wolf.right = true;
                } else {
                    zero.moveBgRight();
                    wolf.moveBgRight();
                    websocket.send("right");
                    zero.right = true;
                    wolf.right = true;
                }
            // }
        }
    // }
    setTimeout(gameLoop, 15);
}

websocket.onmessage = function (message) {
    var command = message.data;

    switch (command) {
        case "left":
            if (zero.slaying) {
                zero.moveLeft();
                wolf.moveLeft();
                zero.right = false;
                wolf.right = false;
            } else {
                zero.moveBgLeft();
                wolf.moveBgLeft();
                zero.right = false;
                wolf.right = false;
            }
            break;
        case "right":
            if (zero.slaying) {
                zero.moveRight();
                wolf.moveRight();
                websocket.send("right");
                zero.right = true;
                wolf.right = true;
            } else {
                zero.moveBgRight();
                wolf.moveBgRight();
                websocket.send("right");
                zero.right = true;
                wolf.right = true;
            }
            break;
        case "stand":
            zero.standStill();
            wolf.standStill();
            break;
        case "jump":
            zero.jumpUp();
            intervalUp = setInterval(function(){zero.jumpUp()}, 0);
            break;
        case "watch":
            var wm = document.querySelector("h1#watch");
            wm.innerHTML = "Watch Mode";
            window.removeEventListener("keydown");
            window.removeEventListener("keyup");
            document.getElementById("start").remove();
            break;
        case "attack":
            if (!zero.right) {
                zero.el.style.left = (zero.getPosX() - 50) + "px";
            }
            zero.temp = 0;
            intervalAtt = setInterval(function(){zero.attack()},0);
            break;
        case "wolf-stand":
            wolf.standStill();
            break;
        case "die":
            zero.die();
            clearInterval(intervalDemon);
            demon.jump();
            wolf.howl();
            intervalDemonJump = setInterval(function(){demon.jump()}, 0);
            break;
        case "startSlay":
            zero.slaying = true;
            demon.el.style.display = "inline";
            demon.moveLeft();
            intervalDemon = setInterval(function(){demon.moveLeft()}, 30);
            break;
    }
};

StartSlay = function() {
    websocket.send("startSlay");
    buttonStart.style.display = "none";
    //buttonStop.style.display = "block";
    zero.slaying = true;
    demon.el.style.display = "inline";
    demon.moveLeft();
    intervalDemon = setInterval(function(){demon.moveLeft()}, 30);
}

zero.rideStill();
zero.startCar();
wolf.jump();
intervalWolfJump = setInterval(function(){wolf.jump()}, 10);
intervalCarRight = setInterval(function(){zero.startCar()}, 35);