var Ourroom = null;
var host = window.document.location.host.replace(/:.*/, '');

var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
var room;

var colors = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];
var players = {};


var RoomObject = {
    
    join : function () {
    client.joinOrCreate("relay", {
    name: document.getElementById('username').value
        }).then(room_instance => {
            room = room_instance

            room.onLeave(() => console.log("Bye, bye."));

            room.onMessage('move', ([sessionId, movement]) => {
                local_move(sessionId, movement);
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
            document.body.appendChild(dom);
            dom.addEventListener('touchdown', RoomObject.touchDown, false);
            window.addEventListener('touchup', RoomObject.touchUp, false);
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
		});
	})
	},

	generateQuestions: function () {

		$('.intro').addClass('hide');
		$('.quiz-container').empty();
		$('.choice-container').empty();

		//append choices
		$('.quiz-container').append(

			'<div class="row justify-content-center animated fadeIn">' + 
				'<div class="col-md-6 col-md-offset-3 col-sm-12 text-center">' + 
					'<div id="1" class="choice">' + 'A'  + '</div>' + 
					'<div id="2" class="choice">' + 'B'  + '</div>' +
					'<div id="3" class="choice">' + 'C'  + '</div>' +
					'<div id="4" class="choice">' + 'D'  + '</div>' +
				'</div>' +
			'</div>'

		);

		gameObject.timer();
		gameObject.questionNumber++;
	},

	//Timer function, use svg and animation to stroke circular timer.
	timer: function () {

		$('.quiz-timer').removeClass('hide');
		
		var initialOffset = '440';
		var currentTime = gameObject.time;
		var i = 0;

		var timer = setInterval(function () {

			$('#timer-count').text(currentTime);
			$('.circle_animation').css('stroke-dashoffset', initialOffset-(i*(initialOffset/gameObject.time)));
	    	
	    	//When time is over
	    	if (currentTime === 0){
	    		//if there is next question, display next question and reset timer
	    		if(gameObject.questionNumber < 11){

	    			gameObject.evalAnswer();
		    		gameObject.questionIndex++;
		    		gameObject.generateQuestions();
		    		clearInterval(timer);
		    		console.log("Time is done! Go to next question");

		    	//if there is no next question, calculate result of game
	    		} else {

	    			currentTime = 0;
	    			clearInterval(timer);
	    			gameObject.evalAnswer(undefined);
	    			gameObject.calcResult();
	    		}
	    	}
	    	currentTime--;

	    	i++;

		}, 1000);

		//handle multiple choices click event 
		$('.choice').on( 'click', function (event){

			var selected = $(this).attr('id');
			var selectedAsInt = parseInt(selected);

			clearInterval(timer);

			if (gameObject.questionNumber < 11) {

				gameObject.evalAnswer(selectedAsInt);
				gameObject.questionIndex++;
				gameObject.generateQuestions();

			} else if (gameObject.questionNumber === 11) {

				currentTime = 0;
				gameObject.evalAnswer(selectedAsInt);
				gameObject.calcResult();

			}

		});
	},

	//Evaluate answers
	evalAnswer: function (choice) {

		var correctAnswer = gameObject.questions[gameObject.questionIndex].answer;

		console.log("------------------ Status ---------------------------------------");
		console.log("evalAnswer() --------- correctAnswer: " + correctAnswer);
		console.log("evalAnswer() --------- choice: " + choice);

		if ( choice === correctAnswer ) {

			gameObject.correctNumber++;
			gameObject.answeredQuestion++;
			gameObject.score += gameObject.questions[gameObject.questionIndex].point;

			// console.log('choice: ' + choice + ' /// ' + 'correct answer: ' + correctAnswer);

		} else if ( choice !== correctAnswer && choice !== undefined) {

			gameObject.incorrectNumber++;
			gameObject.answeredQuestion++;

			// console.log('choice: ' + choice + ' /// ');
		
		} else if (choice === undefined) {

			gameObject.unansweredQuestion++;

		}


		console.log("---------------------------- Result Display -----------------------------")
		console.log("evalAnswer() --------- correct number: " + gameObject.correctNumber);
		console.log("evalAnswer() --------- incorrect number: " + gameObject.incorrectNumber);
		console.log("evalAnswer() --------- unanswered number: " + gameObject.unansweredQuestion);
		console.log("--------------------------------------------------------------------------");

	},

	//Render Result Page.
	calcResult: function () {

		$('.main-board').empty();
		$('.status-board').empty();

		if (gameObject.questionNumber === 11) {

			$('.main-board').append(
				'<h1 class="animated infinite pulse">Calculating...</h1>'
			);

			setTimeout( function () {

				$('.main-board').empty();

				if (gameObject.score === 550) {

					$('.main-board').addClass('animated zoomIn').append(

						'<h2>Congratulation! </h2>'+ 
						'<h2>You Have Earned Maximum Points!</h2>' + 
						'<br>' + 
						'<button class="waves-effect waves-light btn-large btn-flat tooltipped" data-position="right" data-delay="50" data-tooltip="Click To Reload Game." id="resetBtn" onClick="location.reload();">Play Again?</button>'

					)
				} else {

					$('.main-board').addClass('animated zoomIn').append( 

						'<h3>Correct Answer: ' + gameObject.correctNumber + '</h3>' + 
						'<h3>Incorrect Answer: ' + gameObject.incorrectNumber + '</h3>' + 
						'<h3>Unanswered Questions: ' + gameObject.unansweredQuestion + '</h3>' + 
						'<h2>Total Point: ' + gameObject.score + '</h2>' + 
						'<br>' +
						'<button class="waves-effect waves-light btn-large btn-flat tooltipped" data-position="right" data-delay="50" data-tooltip="Click To Reload Game." id="resetBtn" onClick="location.reload();">Play Again?</button>'

					);
				}
				

			}, 2500);
		}
	}
}



window.onload = function () {

	document.getElementById('lobby').style.visibility = "hidden";

	/*
    var host = window.document.URL.replace('/Client/index.html?', '');
    console.log(host);
	*/
    var host = window.document.location.host.replace(/:.*/, '');
    console.log(host)
    //const serverWebsocketUrl = location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ':2567/')

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
	});
}

