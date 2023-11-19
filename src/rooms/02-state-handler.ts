import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    inputUp = 0;
    @type("number")
    inputDown = 0;
    @type("number")
    inputLeft = 0;
    @type("number")
    inputRight = 0;
    @type("number")
    inputFire = 0;
    @type("number")
    x = Math.floor(Math.random() * 400);
    @type("number")
    y = Math.floor(Math.random() * 400);
    @type("number")
    xVelocity = 0;
    @type("number")
    yVelocity = 0;
    @type("number")
    power = 0;
    @type("number")
    reverse = 0;
    @type("number")
    angle = 0;
    @type("number")
    angularVelocity = 0;
    @type("number")
    isThrottling = 0;
    @type("number")
    isReversing = 0;
    @type("number")
    isShooting = 0;
    @type("number")
    isTurningLeft = 0;
    @type("number")
    isTurningRight = 0;
    @type("number")
    isHit = 0;
    @type("number")
    isShot = 0;
    @type("number")
    name = 0;
    @type("number")
    points = 0;
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer (sessionId: string, movement: any) {
        if (movement.x) {
            this.players.get(sessionId).x += movement.x * 10;

        }
        if (movement.y) {
            this.players.get(sessionId).y += movement.y * 10;
        } if(movement.isShooting) {
            this.players.get(sessionId).isShooting = movement.isShooting;
        }
        if (movement.inputUp) {
            this.players.get(sessionId).inputUp = movement.inputUp;
        } if (movement.input_down) {
            this.players.get(sessionId).inputDown = movement.inputDown;
        } if (movement.input_left) {
            this.players.get(sessionId).inputLeft = movement.inputLeft;
        } if (movement.input_right) {
            this.players.get(sessionId).inputRight = movement.inputRight;
        } if (movement.input_fire) {
            this.players.get(sessionId).inputFire = movement.inputFire;
        }

    }
}

export class StateHandlerRoom extends Room<State> {
    maxClients = 4;

    onCreate (options) {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());

        this.onMessage("move", (client, data) => {
            console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
            this.state.movePlayer(client.sessionId, data);
        });
    }

    // onAuth(client, options, req) {
    //     return true;
    // }

    onJoin (client: Client) {
        // client.send("hello", "world");
        console.log(client.sessionId, "joined!");
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        console.log(client.sessionId, "left!");
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}
