import {
  BaseTextButtonOptionScene,
  type TextButtonOptions,
} from "./BaseTextButtonOptionScene";
import { DebugTestScene } from "./DebugTestScene";
import { SocketIOPluginTestOneScene } from "./SocketIOPluginTestScenes";

export class MainMenuScene extends BaseTextButtonOptionScene {
  static readonly SCENE_KEY = "MainMenu";

  constructor() {
    super(MainMenuScene.SCENE_KEY);
  }

  override title(): string | string[] {
    return "Main Menu";
  }

  override options(): TextButtonOptions {
    return {
      align: "left",
      list: [
        {
          onClick: () => {
            this.scene.start(DebugTestScene.SCENE_KEY);
          },
          style: {
            backgroundColor: "#8e8e8e8e",
          },
          text: "Debug Test",
        },
        {
          onClick: () => {
            this.scene.start(SocketIOPluginTestOneScene.SCENE_KEY);
          },
          style: {
            backgroundColor: "#8e8e8e8e",
          },
          text: "Socket IO Test",
        },
      ],
      perPage: 6,
    };
  }
}
