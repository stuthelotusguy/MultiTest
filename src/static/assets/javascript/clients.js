var Gameroom = null;
var Ourroom = null;
var myId = null;

class FirebuttonController {
    constructor(stickID) {
        this.id = stickID;
        let stick = document.getElementById(stickID);

        // location from which drag begins, used to calculate offsets
        this.dragStart = null;

        // track touch identifier in case multiple joysticks present
        this.touchId = null;

        this.active = false;
        this.value = { x: 0, y: 0 };

        let self = this;

        function handleDown(event) {
            self.active = true;

            // all drag movements are instantaneous
            stick.style.transition = '0s';

            // touch event fired before mouse event; prevent redundant mouse event from firing
            event.preventDefault();

            if (event.changedTouches)
                self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
            else
                self.dragStart = { x: event.clientX, y: event.clientY };

            // if this is a touch event, keep track of which one
            if (event.changedTouches)
                self.touchId = event.changedTouches[0].identifier;
        }

        function handleMove(event) {
        }

        function handleUp(event) {
            if (!self.active) return;

            // if this is a touch event, make sure it is the right one
            if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

            // transition the joystick position back to center
            stick.style.transition = '.2s';
            stick.style.transform = `translate3d(0px, 0px, 0px)`;

            // reset everything
            self.value = { x: 0, y: 0 };
            self.touchId = null;
            self.active = false;
        }

        stick.addEventListener('mousedown', handleDown);
        stick.addEventListener('touchstart', handleDown);
        document.addEventListener('mousemove', handleMove, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchend', handleUp);
    }
}

class JoystickController {
    // stickID: ID of HTML element (representing joystick) that will be dragged
    // maxDistance: maximum amount joystick can move in any direction
    // deadzone: joystick must move at least this amount from origin to register value change
    constructor(stickID, maxDistance, deadzone) {
        this.id = stickID;
        let stick = document.getElementById(stickID);

        // location from which drag begins, used to calculate offsets
        this.dragStart = null;

        // track touch identifier in case multiple joysticks present
        this.touchId = null;

        this.active = false;
        this.value = { x: 0, y: 0 };

        let self = this;

        function handleDown(event) {
            self.active = true;

            // all drag movements are instantaneous
            stick.style.transition = '0s';

            // touch event fired before mouse event; prevent redundant mouse event from firing
            event.preventDefault();

            if (event.changedTouches)
                self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
            else
                self.dragStart = { x: event.clientX, y: event.clientY };

            // if this is a touch event, keep track of which one
            if (event.changedTouches)
                self.touchId = event.changedTouches[0].identifier;
        }

        function handleMove(event) {
            if (!self.active) return;

            // if this is a touch event, make sure it is the right one
            // also handle multiple simultaneous touchmove events
            let touchmoveId = null;
            if (event.changedTouches) {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    if (self.touchId == event.changedTouches[i].identifier) {
                        touchmoveId = i;
                        event.clientX = event.changedTouches[i].clientX;
                        event.clientY = event.changedTouches[i].clientY;
                    }
                }

                if (touchmoveId == null) return;
            }

            const xDiff = event.clientX - self.dragStart.x;
            const yDiff = event.clientY - self.dragStart.y;
            const angle = Math.atan2(yDiff, xDiff);
            const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
            const xPosition = distance * Math.cos(angle);
            const yPosition = distance * Math.sin(angle);

            // move stick image to new position
            stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

            // deadzone adjustment
            const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
            const xPosition2 = distance2 * Math.cos(angle);
            const yPosition2 = distance2 * Math.sin(angle);
            const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
            const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));

            self.value = { x: xPercent, y: yPercent };
        }

        function handleUp(event) {
            if (!self.active) return;

            // if this is a touch event, make sure it is the right one
            if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

            // transition the joystick position back to center
            stick.style.transition = '.2s';
            stick.style.transform = `translate3d(0px, 0px, 0px)`;

            // reset everything
            self.value = { x: 0, y: 0 };
            self.touchId = null;
            self.active = false;
        }

        stick.addEventListener('mousedown', handleDown);
        stick.addEventListener('touchstart', handleDown);
        document.addEventListener('mousemove', handleMove, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchend', handleUp);
    }
}

let joystick1 = new JoystickController("stick1", 64, 8);
let firebuttonController1 = new FirebuttonController("button");

controls = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    shoot: 0
}

function circlesHit({ x: x1, y: y1, r: r1 }, { x: x2, y: y2, r: r2 }) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) < (r1 + r2);
}

class gameObject {

    gameRunning = 0;

    constructor(client) {

        //function gotoLobby()
        {
            $('.intro').addClass('hide');
            document.getElementById('lobby').style.visibility = "visible";

            //Join chat
            client.joinOrCreate("chat").then(room => {
                console.log("joined");
                Ourroom = room;
                console.log(room)
                myId = room.sessionId
                Ourroom.send("message", document.getElementById('name').value + " has joined the chat!");
                room.onStateChange.once(function (state) {
                    console.log("initial room state:", state);
                });

                // new room state
                room.onStateChange(function (state) {
                    // this signal is triggered on each patch
                    console.log("room state changed:", state);
                });

                // listen to patches coming from the server
                room.onMessage("messages", function (message) {
                    var p = document.createElement("p");
                    const modifiedMessage = message.replace(myId, document.getElementById('name').value)
                    p.innerText = modifiedMessage;
                    console.log(message)
                    document.querySelector("#messages").appendChild(p);
                });

                //handle send click event 
                $('#sendMsgBtn').on('click', function (event) {
                    // send data to room
                    var p = document.getElementById('sendMessage');
                    Ourroom.send("message", document.getElementById('name').value + " : "+ p.value);
                    // clear input
                    p.value = "";
                });

                //handle start click event
                $('#startGameBtn').on('click', function (event) {
                    $('.intro-section').addClass('hide');
                    $('.lobby').addClass('hide');
                    document.getElementById('messages').style.visibility = "hidden";
                    //document.getElementById('controls').style.visibility = "visible";
                    document.getElementById('joystick').style.visibility = "visible";
                    document.getElementById('stick1').style.visibility = "visible";
                    document.getElementById('button').style.visibility = "visible";
                    //$('.full').addClass('show');
                    if (document.getElementById('castbutton') !== undefined) {
                        document.getElementById('castbutton').click();
                    }

                    localCar.name = document.getElementById('name').value;
                    client.joinOrCreate("tenfoot").then(room_instance => {
                        Gameroom = room_instance;
                        carsById[Gameroom.sessionId] = localCar;
                        sendParams(localCar);

                        // listen to patches coming from the server
                        Gameroom.state.players.onAdd(function (player, sessionId) {
                            player.onChange(function (changes) {
                                let car = localCar;
                                if (player.sessionId === Gameroom.sessionId) {
                                    changes.forEach(change => {
                                        console.log(change.field);
                                        console.log(change.value);
                                        console.log(change.previousValue);
                                        if (change.field === "x") { car.x = change.value; }
                                        if (change.field === "y") { car.y = change.value; }
                                        if (change.field === "xVelocity") { car.xVelocity = change.value; }
                                        if (change.field === "yVelocity") { car.yVelocity = change.value; }
                                        if (change.field === "power") { car.power = change.value; }
                                        if (change.field === "reverse") { car.reverse = change.value; }
                                        if (change.field === "angle") { car.angle = change.value; }
                                        if (change.field === "angularVelocity") { car.angularVelocity = change.value; }
                                        if (change.field === "isThrottling") { car.isThrottling = change.value; }
                                        if (change.field === "isReversing") { car.isReversing = change.value; }
                                        if (change.field === "isShooting") { car.isShooting = change.value; }
                                        if (change.field === "isTurningLeft") { car.isTurningLeft = change.value; }
                                        if (change.field === "isTurningRight") { car.isTurningRight = change.value; }
                                        if (change.field === "isHit") { car.isHit = change.value; }
                                        if (change.field === "isShot") { car.isShot = change.value; }
                                        if (change.field === "name") { car.name = change.value; }
                                        if (change.field === "points") { car.points = change.value; }
                                    })
                                }
                            })
                        });
                    });
                });
            })
        }

        function add() {

            //Create an input type dynamically.
            var element = document.createElement("input");

            //Create Labels
            var label = document.createElement("Label");
            label.innerHTML = "New Label";

            //Assign different attributes to the element.
            element.setAttribute("type", "text");
            element.setAttribute("value", "");
            element.setAttribute("name", "msg");
            element.setAttribute("style", "width:200px");

            label.setAttribute("style", "font-weight:normal");
        }
        function sendParams(car) {
            if (Gameroom) {
                Gameroom.send("move", {
                    sessionId: Gameroom.sessionId,
                    x: car.x,
                    y: car.y,
                    xVelocity: car.xVelocity,
                    yVelocity: car.yVelocity,
                    power: car.power,
                    reverse: car.reverse,
                    angle: car.angle,
                    angularVelocity: car.angularVelocity,
                    isThrottling: car.isThrottling,
                    isReversing: car.isReversing,
                    isShooting: car.isShooting,
                    isTurningLeft: car.isTurningLeft,
                    isTurningRight: car.isTurningRight,
                    isHit: car.isHit,
                    isShot: car.isShot,
                    name: car.name,
                    points: car.points
                });
            }
        }

        const maxPower = 0.075;
        const maxReverse = 0.0375;
        const powerFactor = 0.001;
        const reverseFactor = 0.0005;

        const drag = 0.95;
        const angularDrag = 0.95;
        const turnSpeed = 0.002;

        const WIDTH = 1000;
        const HEIGHT = 1000;

        const localCar = {
            sessionId: "id",
            x: WIDTH / 2,
            y: HEIGHT / 2,
            xVelocity: 0,
            yVelocity: 0,
            power: 0,
            reverse: 0,
            angle: 0,
            angularVelocity: 0,
            isThrottling: 0,
            isReversing: 0,
            isShooting: 0,
            isHit: 0,
            isShot : 0,
            name : 'anonymous',
            points: 0
        };

        const scene = {
            x: window.innerWidth / 2 - localCar.x,
            y: window.innerHeight / 2 - localCar.y
        };

        const cars = [localCar];
        const carsById = {};

        const bullets = [];

        function updateCar(car, i) {
            if (car.isHit || car.isShot) {
                if (car === localCar) {
                    car.isHit = 0;
                    car.isShot = 0;
                    car.x = Math.random() * WIDTH;
                    car.y = Math.random() * HEIGHT;
                    car.xVelocity = 0;
                    car.yVelocity = 0;
                    sendParams(localCar);
                }
            }

            if (car.isThrottling) {
                car.power += powerFactor * car.isThrottling;
            } else {
                car.power -= powerFactor;
            }
            if (car.isReversing) {
                car.reverse += reverseFactor;
            } else {
                car.reverse -= reverseFactor;
            }

            car.power = Math.max(0, Math.min(maxPower, car.power));
            car.reverse = Math.max(0, Math.min(maxReverse, car.reverse));

            const direction = car.power > car.reverse ? 1 : -1;

            if (car.isTurningLeft) {
                car.angularVelocity -= direction * turnSpeed * car.isTurningLeft;
            }
            if (car.isTurningRight) {
                car.angularVelocity += direction * turnSpeed * car.isTurningRight;
            }

            car.xVelocity += Math.sin(car.angle) * (car.power - car.reverse);
            car.yVelocity += Math.cos(car.angle) * (car.power - car.reverse);

            car.x += car.xVelocity;
            car.y -= car.yVelocity;
            car.xVelocity *= drag;
            car.yVelocity *= drag;
            car.angle += car.angularVelocity;
            car.angularVelocity *= angularDrag;

            if (car.isShooting && !car.isShot && !car.isHit) {
                if (!car.lastShootAt || car.lastShootAt < Date.now() - 60) {
                    car.lastShootAt = Date.now();
                    const { x, y, angle, xVelocity, yVelocity } = car;
                    bullets.push({
                        local: car === localCar,
                        x: x + Math.sin(angle) * 10,
                        y: y - Math.cos(angle) * 10,
                        angle,
                        xVelocity: xVelocity + Math.sin(angle) * 1.25,
                        yVelocity: yVelocity + Math.cos(angle) * 1.25,
                        shootAt: Date.now()
                    });
                }
            }
        }

        function update() {
            cars.forEach(updateCar);

            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];

                bullet.x += bullet.xVelocity;
                bullet.y -= bullet.yVelocity;
            }
        }

        let lastTime;
        let acc = 0;
        const step = 1 / 120;

        setInterval(() => {
            let changed;

            var keycontrols = window.getControls();
            controls.up |= keycontrols.up;
            controls.down |= keycontrols.down;
            controls.left |= keycontrols.left;
            controls.right |= keycontrols.right;
            controls.shoot |= keycontrols.shoot;

            const canTurn = localCar.power > 0.0025 || localCar.reverse;

            const throttle = Math.round(controls.up * 10) / 10;
            const reverse = Math.round(controls.down * 10) / 10;
            const isShooting = controls.shoot;

            if (isShooting !== localCar.isShooting) {
                changed = true;
                localCar.isShooting = isShooting;
            }

            if (localCar.isThrottling !== throttle || localCar.isReversing !== reverse) {
                changed = true;
                localCar.isThrottling = throttle;
                localCar.isReversing = reverse;
            }
            const turnLeft = canTurn && Math.round(controls.left * 10) / 10;
            const turnRight = canTurn && Math.round(controls.right * 10) / 10;

            if (localCar.isTurningLeft !== turnLeft) {
                changed = true;
                localCar.isTurningLeft = turnLeft;
            }
            if (localCar.isTurningRight !== turnRight) {
                changed = true;
                localCar.isTurningRight = turnRight;
            }

            if (localCar.x > WIDTH + 7.5) {
                localCar.x -= WIDTH + 15;
                changed = true;
            } else if (localCar.x < -7.5) {
                localCar.x += WIDTH + 15;
                changed = true;
            }

            if (localCar.y > HEIGHT + 7.5) {
                localCar.y -= HEIGHT + 15;
                changed = true;
            } else if (localCar.y < -7.5) {
                localCar.y += HEIGHT + 15;
                changed = true;
            }

            for (let i = 0; i < cars.length; i++) {
                const car = cars[i];

                if (localCar === car) {
                    continue;
                }

                if (car.isShot) {
                    continue;
                }

                if (circlesHit({ x: car.x, y: car.y, r: 7.5 }, { x: localCar.x, y: localCar.y, r: 7.5 })) {
                    localCar.isHit = true;
                    changed = true;
                }
            }

            for (let j = 0; j < cars.length; j++) {
                const car = cars[j];

                for (let i = 0; i < bullets.length; i++) {
                    const bullet = bullets[i];

                    if (bullet && circlesHit({ x: car.x, y: car.y, r: 7.5 }, { x: bullet.x, y: bullet.y, r: 2 })) {
                        if (car !== localCar) {
                            if (!car.isShot) {
                                car.isShot = true;
                                if (bullet.local) {
                                    localCar.points++;
                                }
                                changed = true;
                            }
                            continue;
                        }
                        car.isShot = true;
                        changed = true;
                    }
                }
            }

            const ms = Date.now();
            if (lastTime) {
                acc += (ms - lastTime) / 1000;

                while (acc > step) {
                    update();

                    acc -= step;
                }
            }

            lastTime = ms;

            if (changed) {
                sendParams(localCar);
            }
        }, 1000 / 120);
    }
}

var deadzone = 0.1;

function update(controls) {
    if (joystick1.value.y < -deadzone) {
        controls.up = 1;
    } else if (joystick1.value.y > deadzone) {
        controls.down = 1;
    } else {
        controls.up = 0;
        controls.down = 0;
    }
    if (joystick1.value.x < -deadzone) {
        controls.left = 1;
    } else if (joystick1.value.x > deadzone) {
        controls.right = 1;
    } else {
        controls.left = 0;
        controls.right = 0;
    }
    if (firebuttonController1.active)
        controls.shoot = 1;
    else
        controls.shoot = 0;
}

function loop() {
    requestAnimationFrame(loop);
    update(controls);
}


window.onload = function () {

    document.getElementById('lobby').style.visibility = "hidden";
    document.getElementById('joystick').style.visibility = "hidden";
    document.getElementById('stick1').style.visibility = "hidden";
    document.getElementById('button').style.visibility = "hidden";
    //document.getElementById('controls').style.visibility = "hidden";
    //$('.full').addClass('hide');

	/*
    var host = window.document.URL.replace('/Client/index.html?', '');
    console.log(host);
	*/
    host = window.document.location.host.replace(/:.*/, '');
    console.log(host)
    const serverWebsocketUrl = location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ':2567/')

    //var serverWebsocketUrl = "ws://68.183.196.183:2567/";

    console.log(serverWebsocketUrl);
    var client = new Colyseus.Client(serverWebsocketUrl);

    $('.tooltipped').tooltip({
        delay: 50
    });

    //after 3.5sec, add animation on startBtn
    setTimeout(function () {
        $('#joinBtn').removeClass('bounceInUp').addClass('infinite pulse');
    }, 3500);

    //Join game
    $('#joinBtn').on('click', function () {

        var game = new gameObject(client);
        loop();
    });
}

