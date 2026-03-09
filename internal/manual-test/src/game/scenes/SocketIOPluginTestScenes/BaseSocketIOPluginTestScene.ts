import {
  BaseTextButtonOptionScene,
  type TextButtonOptions,
} from "../BaseTextButtonOptionScene";
import { MainMenuScene } from "../MainMenuScene";

export abstract class BaseSocketIOPluginTestScene extends BaseTextButtonOptionScene {
  abstract otherScene(): string;

  override options(): TextButtonOptions {
    const sceneKey = this.scene.key;

    return {
      align: "center",
      list: [
        // MAIN
        {
          onClick: () => this.socket.connect(),
          tap: (obj) => {
            obj.toggleInteractive(this.socket.status === "disconnected");
            this.socket.on("socket:status_changed", (newStatus) => {
              obj.toggleInteractive(newStatus === "disconnected");
            });
          },
          text: "Connect",
        },
        {
          onClick: () => this.socket.disconnect(),
          tap: (obj) => {
            obj.toggleInteractive(this.socket.status === "connected");
            this.socket.on("socket:status_changed", (newStatus) => {
              obj.toggleInteractive(newStatus === "connected");
            });
          },
          text: "Disconnect",
        },
        {
          onClick: () =>
            this.socket.emit(
              "sent_to_server",
              Phaser.Utils.Array.GetRandom([true, false]),
              Phaser.Math.Between(0, 100),
              Phaser.Utils.String.UUID()
            ),
          tap: (obj) => {
            obj.toggleInteractive(this.socket.status === "connected");
            this.socket.on("socket:status_changed", (newStatus) => {
              obj.toggleInteractive(newStatus === "connected");
            });
          },
          text: "Send Data",
        },

        // SCENE LEVEL LISTENS
        {
          onClick: () => {
            this.socket.on("sent_to_client", (first, second, third) => {
              this.globalDebug.log(
                `On scene (${sceneKey}): ${JSON.stringify(first)} ${JSON.stringify(second)} ${JSON.stringify(third)}`
              );
            });

            this.debug.log(`Registered scene on() listener`);
          },
          text: "Scene: On",
        },
        {
          onClick: () => {
            this.socket.once("sent_to_client", (first, second, third) => {
              this.globalDebug.log(
                `Once scene (${sceneKey}): ${JSON.stringify(first)} ${JSON.stringify(second)} ${JSON.stringify(third)}`
              );
            });

            this.debug.log("Registered scene once() listener");
          },
          text: "Scene: Once",
        },
        {
          onClick: () => {
            this.socket.off("sent_to_client");

            this.debug.log("Registered scene off() listener");
          },
          text: "Scene: Off",
        },

        // GLOBAL LEVEL LISTENS
        {
          onClick: () => {
            this.globalSocket.on("sent_to_client", (first, second, third) => {
              this.globalDebug.log(
                `On global (${sceneKey}): ${JSON.stringify(first)} ${JSON.stringify(second)} ${JSON.stringify(third)}`
              );
            });

            this.debug.log("Registered global on() listener");
          },
          text: "Global: On",
        },
        {
          onClick: () => {
            this.globalSocket.once("sent_to_client", (first, second, third) => {
              this.globalDebug.log(
                `Once global (${sceneKey}): ${JSON.stringify(first)} ${JSON.stringify(second)} ${JSON.stringify(third)}`
              );
            });

            this.debug.log("Registered global once() listener");
          },
          text: "Global: Once",
        },
        {
          onClick: () => {
            this.globalSocket.off("sent_to_client");

            this.debug.log("Registered global off() listener");
          },
          text: "Global: Off",
        },

        // others
        {
          onClick: () => {
            this.scene.start(this.otherScene());
          },
          text: "Other Scene",
        },
        {
          onClick: () => {
            this.scene.start(MainMenuScene.SCENE_KEY);
          },
          text: "Main Menu",
        },
      ],
      perPage: 9,
    };
  }

  override create(): void {
    super.create();

    this.socket.on("socket:status_changed", (newStatus) => {
      this.debug.log(`Status Changed: ${newStatus}`);
    });
  }
}
