var Ourroom = null;
var host = window.document.location.host.replace(/:.*/, '');

var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
var room;

var colors = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];
var players = {};

var RoomObject = {
    
	gotoLobby: function () {
		$('.intro').addClass('hide');
		document.getElementById('lobby').style.visibility = "visible";

	//Join chat
	client.joinOrCreate("chat").then(room => {
		console.log("joined");
		Ourroom = room;
		console.log(room)
		myId = room.sessionId;
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
			document.querySelector("#messages").appendChild(p);
		});

		//handle start click event 
		$('#sendMsgBtn').on( 'click', function (event){
			// send data to room
			var p = document.getElementById('sendMessage');
			Ourroom.send("message", document.getElementById('username').value + ":" + p.value);
			// clear input
			p.value = "";
		});
		$('#startGameBtn').on( 'click', function (event){
        	document.getElementById('lobby').style.display =  "none";
        	document.getElementById('logon').style.display =  "none";
        	document.getElementById('controls').style.visibility = "visible";
		});
	})
	},

    boundingBoxCheck : function (){
	    if (x<0) { x = 0; vx = -vx; }
	    if (y<0) { y = 0; vy = -vy; }
	    if (x>document.documentElement.clientWidth-20) { x = document.documentElement.clientWidth-20; vx = -vx; }
	    if (y>document.documentElement.clientHeight-20) { y = document.documentElement.clientHeight-20; vy = -vy; }
	
    },

    join : function () {

	document.getElementById('logon').style.visibility = "hidden";
	document.getElementById('lobby').style.visibility = "hidden";
	document.getElementById('messages').style.visibility = "hidden";

    client.joinOrCreate("relay", {
    name: document.getElementById('username').value
        }).then(room_instance => {
            room = room_instance

            room.onLeave(() => console.log("Bye, bye."));

            room.onMessage('move', ([sessionId, movement]) => {
                RoomObject.local_move(sessionId, movement);

      if (window.DeviceMotionEvent != undefined) {
	        window.ondevicemotion = function(e) {
		        ax = event.accelerationIncludingGravity.x * 5;
		        ay = event.accelerationIncludingGravity.y * 5;
	        }

	        setInterval( function() {
		        var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
		        if ( landscapeOrientation) {
			        vx = vx + ay;
			        vy = vy + ax;
		        } else {
			        vy = vy - ay;
			        vx = vx + ax;
		        }
		        vx = vx * 0.98;
		        vy = vy * 0.98;
		        y = parseInt(y + vy / 50);
		        x = parseInt(x + vx / 50);
		
		        boundingBoxCheck();
                var movement = {x: x, y: y};
                RoomObject.move (movement);
		
	        }, 25);
        } 
          });

        // listen to patches coming from the server
        room.state.players.onAdd(function (player, sessionId) {
            var dom = document.createElement("div");
            dom.className = "player";
            dom.style.left = "10px";
            dom.style.top = "100px";
            dom.style.background = colors[Math.floor(Math.random() * colors.length)];
            //dom.innerText = `${player.name || "[no name]"} (${sessionId})`;
            dom.innerText = `${player.name || "[no name]"}`;
            players[sessionId] = dom;
            /* Show them:
            document.body.appendChild(dom);
            dom.addEventListener('touchdown', RoomObject.touchDown, false);
            window.addEventListener('touchup', RoomObject.touchUp, false);
            */
        });

        room.state.players.onRemove(function (player, sessionId) {
            document.body.removeChild(players[sessionId]);
            delete players[sessionId];
        });

        window.addEventListener("keydown", function (e) {
            if (e.which === 38) {
                up();
            } else if (e.which === 39) {
                right();

            } else if (e.which === 40) {
                down();

            } else if (e.which === 37) {
                left();
            }
        });

        });
    },

    leave : function () {
        if (room) {
            room.leave();
        }
    },

    local_move : function (sessionId, movement) {
        var dom = players[sessionId];
        if (movement.x) {
            dom.style.left = parseInt(dom.style.left) + movement.x + "px";
        }
        if (movement.y) {
            dom.style.top = parseInt(dom.style.top) + movement.y + "px";
        }
    },

    touchUp : function () {
        window.removeEventListener('touchmove', RoomObject.move, true);
    },

    touchDown : function (e) {
        window.addEventListener('touchmove', RoomObject.move, true);
    },

    move : function (e) {
        var movement = { x:e.movementX, y:e.movementY };
        RoomObject.local_move(room.sessionId, movement);
        room.send("move", movement);
    },

    up  : function () {
        var movement = { y: -10 };

        // move locally instantly
        RoomObject.local_move(room.sessionId, movement);

        room.send("move", movement);
    },

    right  : function () {
        var movement = { x: 10 };

        // move locally instantly
        RoomObject.local_move(room.sessionId, movement);

        room.send("move", movement);
    },

    down  : function () {
        var movement = { y: 10 };

        // move locally instantly
        RoomObject.local_move(room.sessionId, movement);

        room.send("move", movement);
    },

    left  : function () {
        var movement = { x: -10 };

        // move locally instantly
        RoomObject.local_move(room.sessionId, movement);

        room.send("move", movement);
    }
}


window.onload = function () {

	document.getElementById('lobby').style.visibility = "hidden";
	document.getElementById('controls').style.visibility = "hidden";

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
}

