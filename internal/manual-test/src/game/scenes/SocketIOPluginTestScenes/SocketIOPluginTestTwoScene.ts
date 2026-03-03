import { BaseSocketIOPluginTestScene } from "./BaseSocketIOPluginTestScene";
import { SocketIOPluginTestOneScene } from "./SocketIOPluginTestOneScene";

export class SocketIOPluginTestTwoScene extends BaseSocketIOPluginTestScene {
  static readonly SCENE_KEY = "SOcketIOPluginTestTwo";

  constructor() {
    super(SocketIOPluginTestTwoScene.SCENE_KEY);
  }

  override title(): string | string[] {
    return "Socket Plugin Test Two";
  }

  override otherScene(): string {
    return SocketIOPluginTestOneScene.SCENE_KEY;
  }
}
