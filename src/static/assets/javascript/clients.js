var Gameroom = null;
var Ourroom = null;

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

var gameObject = {

	gameRunning: 0,

	add : function () {

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
	},

	gotoLobby: function (client) {
		$('.intro').addClass('hide');
		document.getElementById('lobby').style.visibility = "visible";

	//Join chat
	client.joinOrCreate("chat").then(room => {
		console.log("joined");
		Ourroom = room;
		console.log(room)
		myId = room.sessionId
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
		$('#sendMsgBtn').on( 'click', function (event){
			// send data to room
			var p = document.getElementById('sendMessage');
			Ourroom.send("message", p.value);
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
            //$('.full').addClass('show');
            client.joinOrCreate("tenfoot").then(room_instance => {
                Gameroom = room_instance
            });
		});
	})
        client.joinOrCreate("tenfoot").then(room_instance => {
            Gameroom = room_instance
        });
	}
}

var inputs = {
    inputUp : 0,
    inputDown : 0,
    inputLeft : 0,
    inputRight : 0,
    inputFire : 0
}

var deadzone = 0;

function update() {
    //document.getElementById("status1").innerText = "Joystick 1: " + JSON.stringify(joystick1.value);
    if (Gameroom !== null) {
        if (joystick1.value.y === 0) {
            if (inputs.inputDown === 1) {
                inputs.inputDown = 0
                Gameroom.send("move", {
                    inputDown: -1
                })
            }
            if (inputs.inputUp === 1) {
                inputs.inputUp = 0
                Gameroom.send("move", {
                    inputUp: -1
                })
            }
        }else
            if (joystick1.value.y < -deadzone) {
            if (inputs.inputUp === 0) {
                inputs.inputUp = 1
                Gameroom.send("move", {
                    inputUp: 1
                })
            }
            if (inputs.inputDown === 1) {
                inputs.inputDown = 0
                Gameroom.send("move", {
                    inputDown: -1
                })
            }
            } else if (joystick1.value.y > deadzone) {
            if (inputs.inputDown === 0) {
                inputs.inputDown = 1
                Gameroom.send("move", {
                    inputDown: 1
                })
            }
            if (inputs.inputUp === 1) {
                inputs.inputUp = 0
                Gameroom.send("move", {
                    inputUp: -1
                })
            }
        }
        if (joystick1.value.x === 0) {
            if (inputs.inputRight === 1) {
                inputs.inputRight = 0
                Gameroom.send("move", {
                    inputRight: -1
                })
            }
            if (inputs.inputLeft === 1) {
                inputs.inputLeft = 0
                Gameroom.send("move", {
                    inputLeft: -1
                })
            }
        } else
            if (joystick1.value.x < -deadzone) {
            if (inputs.inputLeft === 0) {
                inputs.inputLeft = 1
                Gameroom.send("move", {
                    inputLeft: 1
                })
            }
            if (inputs.inputRight === 1) {
                inputs.inputRight = 0
                Gameroom.send("move", {
                    inputRight: -1
                })
            }
            } else if (joystick1.value.x > deadzone) {
            if (inputs.inputRight === 0) {
                inputs.inputRight = 1
                Gameroom.send("move", {
                    inputRight: 1
                })
            }
            if (inputs.inputLeft === 1) {
                inputs.inputLeft = 0
                Gameroom.send("move", {
                    inputLeft: -1
                })
            }
        }
    };
}

function loop() {
    requestAnimationFrame(loop);
    update();
}


window.onload = function () {

	document.getElementById('lobby').style.visibility = "hidden";
    document.getElementById('joystick').style.visibility = "hidden";
    //document.getElementById('controls').style.visibility = "hidden";
    //$('.full').addClass('hide');

	/*
    var host = window.document.URL.replace('/Client/index.html?', '');
    console.log(host);
	*/
    //host = window.document.location.host.replace(/:.*/, '');
    /*console.log(host)
    const serverWebsocketUrl = location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ':2567/')
    */

	var serverWebsocketUrl = "ws://192.168.1.179:2567/";

    console.log(serverWebsocketUrl);
    var client = new Colyseus.Client(serverWebsocketUrl);

	$('.tooltipped').tooltip({
		delay: 50
	});

	//after 3.5sec, add animation on startBtn
	setTimeout ( function () {
		$('#joinBtn').removeClass('bounceInUp').addClass('infinite pulse');
	}, 3500);

	//Join game
	$('#joinBtn').on('click', function () {
		let myId = null

		gameObject.gotoLobby(client);
        loop();
	});
}

