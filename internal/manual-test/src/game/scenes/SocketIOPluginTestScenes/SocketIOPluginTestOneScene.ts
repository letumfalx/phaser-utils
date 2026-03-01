import { BaseSocketIOPluginTestScene } from "./BaseSocketIOPluginTestScene";
import { SocketIOPluginTestTwoScene } from "./SocketIOPluginTestTwoScene";

export class SocketIOPluginTestOneScene extends BaseSocketIOPluginTestScene {
  static readonly SCENE_KEY = "SOcketIOPluginTestOne";

  constructor() {
    super(SocketIOPluginTestOneScene.SCENE_KEY);
  }

  override title(): string | string[] {
    return "Socket Plugin Test One";
  }

  override otherScene(): string {
    return SocketIOPluginTestTwoScene.SCENE_KEY;
  }
}
