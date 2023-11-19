/*
function MOBILE_CONTROL() {

    this.X = null;
    this.Y = null;
    this.LAST_X_POSITION = null;
    this.LAST_Y_POSITION = null;
    this.MULTI_TOUCH = 'NO';
    this.MULTI_TOUCH_X1 = null;
    this.MULTI_TOUCH_X2 = null;
    this.MULTI_TOUCH_X3 = null;
    this.MULTI_TOUCH_X4 = null;
    this.MULTI_TOUCH_X5 = null;
    this.MULTI_TOUCH_Y1 = null;
    this.MULTI_TOUCH_Y2 = null;
    this.MULTI_TOUCH_Y3 = null;
    this.MULTI_TOUCH_Y4 = null;
    this.MULTI_TOUCH_Y5 = null;
    this.MULTI_TOUCH_X6 = null;
    this.MULTI_TOUCH_X7 = null;
    this.MULTI_TOUCH_X8 = null;
    this.MULTI_TOUCH_X9 = null;
    this.MULTI_TOUCH_X10 = null;
    this.MULTI_TOUCH_Y6 = null;
    this.MULTI_TOUCH_Y7 = null;
    this.MULTI_TOUCH_Y8 = null;
    this.MULTI_TOUCH_Y9 = null;
    this.MULTI_TOUCH_Y10 = null;
    this.MULTI_TOUCH_INDEX = 1;
    this.SCREEN = [window.innerWidth, window.innerHeight];
    this.SCREEN.W = this.SCREEN[0];
    this.SCREEN.H = this.SCREEN[1];

    this.PRESSED = {
        UP : 0,
        DOWN : 0,
        LEFT : 0,
        RIGHT : 0,
        FIRE : 0
    }

    this.BUTTONS = {
        UP_X1 : 0,
        UP_X2 : 275,
        UP_Y1 : 0,
        UP_Y2 : 275,

        DOWN_X1 : 0,
        DOWN_X2 : 275,
        DOWN_Y1 : 325,
        DOWN_Y2 : 580,

        LEFT_X1 : 400,
        LEFT_X2 : 650,
        LEFT_Y1 : 325,
        LEFT_Y2 : 580,

        RIGHT_X1 : 675,
        RIGHT_X2 : 950,
        RIGHT_Y1 : 325,
        RIGHT_Y2 : 580,

        FIRE_X1 : 525,
        FIRE_X2 : 780,
        FIRE_Y1 : 0,
        FIRE_Y2 : 275,
    }
    this.checkHit = function (index, x, y) {
        hit = 0;
        if (x > this.BUTTONS.UP_X1) {
            if (y > this.BUTTONS.UP_Y1) {
                if (x < this.BUTTONS.UP_X2) {
                    if (y < this.BUTTONS.UP_Y2) {
                        this.PRESSED.UP = index;
                        console.log('UP Pressed!');
                        hit = 1;
                        Gameroom.send("move", {
                            inputUp: 1
                        });
                    }
                }
            }
        }
        if (hit !== 1 && this.PRESSED.UP !== 0) {
            this.PRESSED.UP = 0;
            console.log('UP Released!');
            Gameroom.send("move", {
                inputUp: -1
            });
        }
        hit = 0;
        if (x > this.BUTTONS.DOWN_X1) {
            if (y > this.BUTTONS.DOWN_Y1) {
                if (x < this.BUTTONS.DOWN_X2) {
                    if (y < this.BUTTONS.DOWN_Y2) {
                        this.PRESSED.DOWN = index;
                        console.log('DOWN Pressed!');
                        hit = 1;
                        Gameroom.send("move", {
                            inputDown: 1
                        });
                    }
                }
            }
        }
        if (hit !== 1 && this.PRESSED.DOWN !== 0) {
            this.PRESSED.DOWN = 0;
            console.log('DOWN Released!');
            Gameroom.send("move", {
                inputDown: -1
            });
        }
        hit = 0;
        if (x > this.BUTTONS.LEFT_X1) {
            if (y > this.BUTTONS.LEFT_Y1) {
                if (x < this.BUTTONS.LEFT_X2) {
                    if (y < this.BUTTONS.LEFT_Y2) {
                        this.PRESSED.LEFT = index;
                        console.log('LEFT Pressed!');
                        hit = 1;
                        Gameroom.send("move", {
                            inputLeft: 1
                        });
                    }
                }
            }
        }
        if (hit !== 1 && this.PRESSED.LEFT !== 0) {
            this.PRESSED.LEFT = 0;
            console.log('LEFT Released!');
            Gameroom.send("move", {
                inputLeft: -1
            });
        }
        hit = 0;
        if (x > this.BUTTONS.RIGHT_X1) {
            if (y > this.BUTTONS.RIGHT_Y1) {
                if (x < this.BUTTONS.RIGHT_X2) {
                    if (y < this.BUTTONS.RIGHT_Y2) {
                        this.PRESSED.RIGHT = index;
                        console.log('RIGHT Pressed!');
                        hit = 1;
                        Gameroom.send("move", {
                            inputRight: 1
                        });
                    }
                }
            }
        }
        if (hit !== 1 && this.PRESSED.RIGHT !== 0) {
            this.PRESSED.RIGHT = 0;
            console.log('RIGHT Released!');
            Gameroom.send("move", {
                inputRight: -1
            });
        }
        hit = 0;
        if (x > this.BUTTONS.FIRE_X1) {
            if (y > this.BUTTONS.FIRE_Y1) {
                if (x < this.BUTTONS.FIRE_X2) {
                    if (y < this.BUTTONS.FIRE_Y2) {
                        this.PRESSED.FIRE = index;
                        console.log('FIRE Pressed!');
                        hit = 1;
                        Gameroom.send("move", {
                            inputFire: 1
                        });
                    }
                }
            }
        }
        if (hit !== 1 && this.PRESSED.FIRE !== 0) {
            this.PRESSED.FIRE = 0;
            console.log('FIRE Released!');
            Gameroom.send("move", {
                inputFire: -1
            });
        }
        //sendInputs(Gameroom, this.PRESSED);
    }
}

//definition
var CONTROL = new MOBILE_CONTROL();

//###################################################################
//EVENTS
//###################################################################  
document.addEventListener('touchstart', function (event) {

    if (CONTROL.MULTI_TOUCH == 'NO') {

        var touch = event.touches[0];
        CONTROL.X = touch.pageX;
        CONTROL.Y = touch.pageY;
        console.log('TOUCH START AT:(X' + CONTROL.X + '),(' + CONTROL.Y + ')');
        CONTROL.checkHit(1, CONTROL.X, CONTROL.Y);
    }
    else if (CONTROL.MULTI_TOUCH == 'YES') {

        var touches_changed = event.changedTouches;

        for (var i = 0; i < touches_changed.length; i++) {

            //CONTROL.MULTI_TOUCH_X1
            console.log("multi touch : x" + CONTROL.MULTI_TOUCH_INDEX + ":(" + touches_changed[i].pageX + ")");
            switch (CONTROL.MULTI_TOUCH_INDEX) {
                case 1:
                    CONTROL.MULTI_TOUCH_X1 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y1 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 2:
                    CONTROL.MULTI_TOUCH_X2 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y2 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 3:
                    CONTROL.MULTI_TOUCH_X3 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y3 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 4:
                    CONTROL.MULTI_TOUCH_X4 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y4 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 5:
                    CONTROL.MULTI_TOUCH_X5 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y5 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 6:
                    CONTROL.MULTI_TOUCH_X6 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y6 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 7:
                    CONTROL.MULTI_TOUCH_X7 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y7 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 8:
                    CONTROL.MULTI_TOUCH_X8 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y8 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 9:
                    CONTROL.MULTI_TOUCH_X9 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y9 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 10:
                    CONTROL.MULTI_TOUCH_X10 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y10 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                default:
                //code to be executed if n is different from case 1 and 2
            }
            CONTROL.MULTI_TOUCH_INDEX = CONTROL.MULTI_TOUCH_INDEX + 1;
        }

    }

    CONTROL.MULTI_TOUCH = 'YES';

}, false);

////////////////////////////////////////////////////////
document.addEventListener('touchmove', function (event) {
    var touch = event.touches[0];
    CONTROL.X = touch.pageX;
    CONTROL.Y = touch.pageY;
    console.log('TOUCH MOVE AT:(X' + CONTROL.X + '),(' + CONTROL.Y + ')');
    CONTROL.checkHit(1, CONTROL.X, CONTROL.Y);

    //#############
    if (CONTROL.MULTI_TOUCH == 'YES') {

        var touches_changed = event.changedTouches;

        for (var i = 0; i < touches_changed.length; i++) {

            //CONTROL.MULTI_TOUCH_X1
            console.log("multi touch : x" + CONTROL.MULTI_TOUCH_INDEX + ":(" + touches_changed[i].pageX + ")");
            switch (i) {
                case 1:
                    CONTROL.MULTI_TOUCH_X1 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y1 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 2:
                    CONTROL.MULTI_TOUCH_X2 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y2 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 3:
                    CONTROL.MULTI_TOUCH_X3 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y3 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 4:
                    CONTROL.MULTI_TOUCH_X4 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y4 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 5:
                    CONTROL.MULTI_TOUCH_X5 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y5 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 6:
                    CONTROL.MULTI_TOUCH_X6 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y6 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 7:
                    CONTROL.MULTI_TOUCH_X7 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y7 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 8:
                    CONTROL.MULTI_TOUCH_X8 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y8 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 9:
                    CONTROL.MULTI_TOUCH_X9 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y9 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                case 10:
                    CONTROL.MULTI_TOUCH_X10 = touches_changed[i].pageX;
                    CONTROL.MULTI_TOUCH_Y10 = touches_changed[i].pageY;
                    CONTROL.checkHit(CONTROL.MULTI_TOUCH_INDEX, touches_changed[i].pageX, touches_changed[i].pageY);
                    break;
                default:
                //code to be executed if n is different from case 1 and 2
            }
        }
    }

    //#############
    event.preventDefault();

}, false);

////////////////////////////////////////////////////////
document.addEventListener('touchend', function (event) {
    CONTROL.LAST_X_POSITION = CONTROL.X;
    CONTROL.LAST_Y_POSITION = CONTROL.Y;
    CONTROL.MULTI_TOUCH = 'NO';
    CONTROL.MULTI_TOUCH_INDEX = 1;

    CONTROL.MULTI_TOUCH_X1 = null;
    CONTROL.MULTI_TOUCH_X2 = null;
    CONTROL.MULTI_TOUCH_X3 = null;
    CONTROL.MULTI_TOUCH_X4 = null;
    CONTROL.MULTI_TOUCH_X5 = null;
    CONTROL.MULTI_TOUCH_X6 = null;
    CONTROL.MULTI_TOUCH_X7 = null;
    CONTROL.MULTI_TOUCH_X8 = null;
    CONTROL.MULTI_TOUCH_X9 = null;
    CONTROL.MULTI_TOUCH_X10 = null;
    CONTROL.MULTI_TOUCH_Y1 = null;
    CONTROL.MULTI_TOUCH_Y2 = null;
    CONTROL.MULTI_TOUCH_Y3 = null;
    CONTROL.MULTI_TOUCH_Y4 = null;
    CONTROL.MULTI_TOUCH_Y5 = null;
    CONTROL.MULTI_TOUCH_Y6 = null;
    CONTROL.MULTI_TOUCH_Y7 = null;
    CONTROL.MULTI_TOUCH_Y8 = null;
    CONTROL.MULTI_TOUCH_Y9 = null;
    CONTROL.MULTI_TOUCH_Y10 = null;

    CONTROL.BUTTONS.UP = 0;
    CONTROL.BUTTONS.DOWN = 0;
    CONTROL.BUTTONS.LEFT = 0;
    CONTROL.BUTTONS.RIGHT = 0;
    CONTROL.BUTTONS.FIRE = 0;

    console.log('LAST TOUCH POSITION AT:(X' + CONTROL.X + '),(' + CONTROL.Y + ')');

    CONTROL.checkHit(1, -1, -1);
}, false);

////////////////////////////////////////////////////////
document.addEventListener("touchcancel", function (event) {
    CONTROL.BUTTONS.UP = 0;
    CONTROL.BUTTONS.DOWN = 0;
    CONTROL.BUTTONS.LEFT = 0;
    CONTROL.BUTTONS.RIGHT = 0;
    CONTROL.BUTTONS.FIRE = 0;

    console.log('BREAK - LAST TOUCH POSITION AT:(X' + CONTROL.X + '(,(' + CONTROL.Y + ')');
    CONTROL.checkHit(1, -1, -1);
}, false);

*/