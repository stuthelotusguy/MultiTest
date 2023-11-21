import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
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
    @type("string")
    name = 'anonymous';
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

    movePlayer(sessionId: string, movement: any) {
        if (movement.x !== 'undefined') {
            this.players.get(sessionId).x = movement.x;
        } if (movement.y !== 'undefined') {
            this.players.get(sessionId).y = movement.y;
        } if (movement.xVelocity !== 'undefined') {
            this.players.get(sessionId).xVelocity = movement.xVelocity;
        } if (movement.yVelocity !== 'undefined') {
            this.players.get(sessionId).yVelocity = movement.yVelocity;
        } if (movement.power !== 'undefined') {
            this.players.get(sessionId).power = movement.power;
        } if (movement.reverse !== 'undefined') {
            this.players.get(sessionId).reverse = movement.reverse;
        } if (movement.angle !== 'undefined') {
            this.players.get(sessionId).angle = movement.angle;
        } if (movement.angularVelocity !== 'undefined') {
            this.players.get(sessionId).angularVelocity = movement.angularVelocity;
        } if (movement.isThrottling !== 'undefined') {
            this.players.get(sessionId).isThrottling = movement.isThrottling;
        } if (movement.isReversing !== 'undefined') {
            this.players.get(sessionId).isReversing = movement.isReversing;
        } if (movement.isShooting !== 'undefined') {
            this.players.get(sessionId).isShooting = movement.isShooting;
        } if (movement.isTurningLeft !== 'undefined') {
            this.players.get(sessionId).isTurningLeft = movement.isTurningLeft;
        } if (movement.isTurningRight !== 'undefined') {
            this.players.get(sessionId).isTurningRight = movement.isTurningRight;
        } if (movement.isHit !== 'undefined') {
            this.players.get(sessionId).isHit = movement.isHit;
        } if (movement.isShot !== 'undefined') {
            this.players.get(sessionId).isShot = movement.isShot;
        } if (movement.name !== 'undefined') {
            this.players.get(sessionId).name = movement.name;
        } if (movement.points !== 'undefined') {
            this.players.get(sessionId).points = movement.points;
        }
    }
}

export class GameHandlerRoom extends Room<State> {
    maxClients = 25;

    onCreate(options) {
        console.log("GameHandlerRoom created!", options);

        this.setState(new State());

        this.onMessage("move", (client, data) => {
            console.log("GameHandlerRoom received message from", client.sessionId, ":", data);
            this.state.movePlayer(client.sessionId, data);
        });
    }

    // onAuth(client, options, req) {
    //     return true;
    // }

    onJoin(client: Client) {
        // client.send("hello", "world");
        console.log(client.sessionId, "joined!");
        this.state.createPlayer(client.sessionId);
    }

    onLeave(client) {
        console.log(client.sessionId, "left!");
        this.state.removePlayer(client.sessionId);
    }

    onDispose() {
        console.log("Dispose GameHandlerRoom");
    }

}
