var players = {};
var Ourroom = null;
var Gameroom = null;

function circlesHit({ x: x1, y: y1, r: r1 }, { x: x2, y: y2, r: r2 }) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) < (r1 + r2);
}

var gameObject = {

    join: function (client) {
        //Join chat
        client.joinOrCreate("chat").then(room => {
            console.log("joined");
            Ourroom = room;
            console.log(room)
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
                const modifiedMessage = message.replace(/\(.*?\)/g, "");
                p.innerText = modifiedMessage;
                console.log(message)
                document.querySelector(".messages").appendChild(p);
            });
        });

        client.joinOrCreate("tenfoot").then(room_instance => {
            Gameroom = room_instance

            // listen to patches coming from the server
            Gameroom.state.players.onAdd(function (player, sessionId) {
                let car = carsById[sessionId];

                if (Gameroom.sessionId != sessionId && car === undefined)
                {
                    car = {
                        $el: null,
                        sessionId: sessionId,
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
                        name: '',
                        points: 0,
                        player: null
                    };
                    const $el = document.createElement('div');
                    $el.classList.add('car');
                    const $body = document.createElement('div');
                    $body.classList.add('car-body');
                    const $roof = document.createElement('div');
                    $roof.classList.add('car-roof');
                    const $name = document.createElement('div');
                    $name.classList.add('car-name');
                    $body.appendChild($roof);
                    $el.appendChild($body);
                    $el.appendChild($name);
                    $cars.appendChild($el);
                    car.name = sessionId;
                    car.$el = $el;
                    carsById[sessionId] = car;
                    car.player = player;
                    cars.push(car);

                    players[sessionId] = $el;
                    document.body.appendChild($el);

                    player.onChange(function (changes) {
                        changes.forEach(change => {
                            console.log(change.field);
                            console.log(change.value);
                            console.log(change.previousValue);
                            if (change.field === "sessionId") { car.sessionId = change.value; }
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
                    })
                }
            });

            Gameroom.state.players.onRemove(function (player, sessionId) {
                const car = carsById[sessionId];

                if (!car) {
                    return console.error('Car not found');
                }

                for (let i = 0; i < cars.length; i++) {
                    if (cars[i] === car) {
                        cars.splice(i, 1);
                        break;
                    }
                }

                if (car.$el.parentNode) {
                    car.$el.parentNode.removeChild(car.$el);
                }
                delete carsById[sessionId];
                //document.body.removeChild(players[sessionId]);
                //delete players[sessionId];
            });
        });
    },

    leave: function () {
        if (room) {
            room.leave();
        }
    },
}

var gameRunning = 0;

// Physics

const maxPower = 0.075;
const maxReverse = 0.0375;
const powerFactor = 0.001;
const reverseFactor = 0.0005;

const drag = 0.95;
const angularDrag = 0.95;
const turnSpeed = 0.002;

const $canvas = document.querySelector('canvas');

const ctx = $canvas.getContext('2d');

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

ctx.fillStyle = 'hsla(0, 0%, 25%, 0.25)';

const $scene = document.querySelector('.scene');
const $cars = document.querySelector('.cars');
const $map = document.querySelector('.map');
const $bullets = document.querySelector('.bullets');

const $points = document.querySelector('.points');

const localCar = {
    $el: document.querySelector('.car'),
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
    name:'anonymous',
    points: 0,
    player: null
};

const scene = {
    x: window.innerWidth / 2/* - localCar.x*/,
    y: window.innerHeight / 2/* - localCar.y*/
};

cars = [];
const carsById = {};

function sendParams(car) {
    if (Gameroom) {
        Gameroom.send("move", {
            sessionId: car.sessionId,
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

function resizeHandler() {
    for (let j = 0; j < cars.length; j++) {
        const car = cars[j];
        car.x = (car.x * window.innerWidth) / WIDTH;
        car.y = (car.y * window.innerHeight) / HEIGHT;
        sendParams(car);
    }
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    console.log("size changed:", WIDTH, HEIGHT);
}

if (window.location.search === '?test') {
    cars.push({ ...localCar });
    cars[1].$el = cars[0].$el.cloneNode(true);
    cars[0].$el.parentNode.appendChild(cars[1].$el);
}

const bullets = [];

function updateCar(car, i) {

    /*
    if (car.isHit || car.isShot) {
        //if (car === localCar) 
        {
            car.isHit = false;
            car.isShot = false;
            car.x = Math.random() * WIDTH;
            car.y = Math.random() * HEIGHT;
            car.xVelocity = 0;
            car.yVelocity = 0;
        }
    }
    */

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

function applyInputs(car, i){
    for (let i = 0; i < cars.length; i++) {
        const car2 = cars[i];

        if (car2 === car) {
            continue;
        }

        if (car2.isShot) {
            continue;
        }

        if (circlesHit({ x: car2.x, y: car2.y, r: 7.5 }, { x: car.x, y: car.y, r: 7.5 })) {
            //car.isHit = 1;
            changed = true;
        }
    }

    for (let j = 0; j < cars.length; j++) {
        const car2 = cars[j];

        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];

            if (bullet && circlesHit({ x: car2.x, y: car2.y, r: 7.5 }, { x: bullet.x, y: bullet.y, r: 2 })) {
                if (car2 !== car) {
                    if (!car2.isShot) {
                        //car2.isShot = 1;
                        if (bullet.local) {
                            car.points++;
                        }
                        changed = true;
                    }
                    continue;
                }
                //car2.isShot = 1;
                changed = true;
            }
        }
    }
}

function update() {
    cars.forEach(applyInputs);
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
    const ms = Date.now();
    if (lastTime) {
        acc += (ms - lastTime) / 1000;

        while (acc > step) {
            update();

            acc -= step;
        }
    }

    lastTime = ms;
}, 1000 / 120);

function renderCar(car, index) {
    const { x, y, angle, power, reverse, angularVelocity } = car;

    if (!car.$el) {
        return;
    }
    if (!car.$body) {
        car.$body = car.$el.querySelector('.car-body');
    }

    if (!car.$name) {
        car.$name = car.$el.querySelector('.car-name');
    }

    car.$el.style.transform = `translate(${x}px, ${y}px)`;
    car.$body.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
    car.$name.textContent = car.name || '';

    if (car.isShot) {
        car.$body.classList.add('shot');
    } else {
        car.$body.classList.remove('shot');
    }

    if ((power > 0.0025) || reverse) {
        if (((maxReverse === reverse) || (maxPower === power)) && Math.abs(angularVelocity) < 0.002) {
            return;
        }
        size = 6;
        ctx.fillRect(
            x - Math.cos(angle + 3 * Math.PI / 2) * size + Math.cos(angle + 2 * Math.PI / 2) * size,
            y - Math.sin(angle + 3 * Math.PI / 2) * size + Math.sin(angle + 2 * Math.PI / 2) * size,
            2,
            2
        );
        ctx.fillRect(
            x - Math.cos(angle + 3 * Math.PI / 2) * size + Math.cos(angle + 4 * Math.PI / 2) * size,
            y - Math.sin(angle + 3 * Math.PI / 2) * size + Math.sin(angle + 4 * Math.PI / 2) * size,
            2,
            2
        );
    }

    {
        const angle = Math.atan2((car.y - (HEIGHT / 2)), (car.x - (WIDTH / 2)));

        let $mapitem = $map.childNodes[index - 1];

        if (!$mapitem) {
            $mapitem = document.createElement('div');
            $mapitem.classList.add('map-item');
            $map.appendChild($mapitem);
        }

        const x = localCar.x + Math.cos(angle) * 12.5;
        const y = localCar.y + Math.sin(angle) * 12.5;

        $mapitem.style.transform = `translate(${x}px, ${y}px)`;
    }
}

function render(ms) {
    requestAnimationFrame(render);

    $points.textContent = cars
        .slice()
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .map(car => {
            return [car.name || 'anonymous', car.points || 0].join(': ');
        }).join('\n');

    cars.forEach(renderCar);

/* Map view */
    if (cars.length > 0) {
        while ($map.childNodes.length > cars.length - 1) {
            $map.removeChild($map.childNodes[$map.childNodes.length - 1]);
        }
    }

    const now = Date.now();

    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        const { x, y, shootAt } = bullet;
        if (!bullet.$el) {
            const $el = bullet.$el = document.createElement('div');
            $el.classList.add('bullet');
            $bullets.appendChild($el);
        }
        bullet.$el.style.transform = `translate(${x}px, ${y}px)`;

        if (shootAt < now - 600) {
            if (bullet.$el) {
                $bullets.removeChild(bullet.$el);
                bullets.splice(i--, 1);
            }
        }
    }
}

  setInterval(() => {
    ctx.fillStyle = 'hsla(0, 0%, 95%, 0.2)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'hsla(0, 0%, 25%, 0.5)';
  }, 15 * 1000);

  function circlesHit ({ x: x1, y: y1, r: r1 }, { x: x2, y: y2, r: r2 }) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) < (r1 + r2);
  }

requestAnimationFrame(render);

window.onload = function () {

    host = window.document.location.host.replace(/:.*/, '');
    console.log(host)
    const serverWebsocketUrl = location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ':2567/')

    //var serverWebsocketUrl = "ws://68.183.196.183:2567/";

    console.log(serverWebsocketUrl);
    var client = new Colyseus.Client(serverWebsocketUrl);

    gameObject.join(client);
}

window.addEventListener('resize', function (event) {
    resizeHandler();
}, true);

