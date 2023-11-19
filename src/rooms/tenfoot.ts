import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    inputUp = -1000;
    @type("number")
    inputDown = -1000;
    @type("number")
    inputLeft = -1000;
    @type("number")
    inputRight = -1000;
    @type("number")
    inputFire = -1000;
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
        if (movement.inputUp) {
            this.players.get(sessionId).inputUp = movement.inputUp;
        } if (movement.inputDown) {
            this.players.get(sessionId).inputDown = movement.inputDown;
        } if (movement.inputLeft) {
            this.players.get(sessionId).inputLeft = movement.inputLeft;
        } if (movement.inputRight) {
            this.players.get(sessionId).inputRight = movement.inputRight;
        } if (movement.inputFire) {
            this.players.get(sessionId).inputFire = movement.inputFire;
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
