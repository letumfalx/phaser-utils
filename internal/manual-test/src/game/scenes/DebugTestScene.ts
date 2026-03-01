import {
  BaseTextButtonOptionScene,
  type TextButtonOptions,
} from "./BaseTextButtonOptionScene";
import { MainMenuScene } from "./MainMenuScene";

export class DebugTestScene extends BaseTextButtonOptionScene {
  static readonly SCENE_KEY = "debug";

  constructor() {
    super(DebugTestScene.SCENE_KEY);
  }

  override title(): string | string[] {
    return "Debug Test";
  }

  override options(): TextButtonOptions {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      backgroundColor: "#8e8e8e8e",
    };

    return {
      align: "center",
      list: [
        {
          onClick: () => this.globalDebug.log("global level"),
          style,
          text: "Global Level",
        },
        {
          onClick: () => this.debug.log("scene level"),
          style,
          text: "Scene Level",
        },
        {
          onClick: () => this.scene.start(MainMenuScene.SCENE_KEY),
          style: { ...style, backgroundColor: "green" },
          text: "Back to Main Menu",
        },
      ],
      perPage: 3,
    };
  }
}
