export class Text extends Phaser.GameObjects.Text {
  constructor(
    scene: Phaser.Scene,
    text: string | string[],
    x = 0,
    y = 0,
    style: undefined | null | Phaser.Types.GameObjects.Text.TextStyle = {}
  ) {
    super(scene, x, y, text, {
      color: "#FFFFFF",
      fontFamily: "sans-serif",
      fontSize: "24px",
      ...style,
    });
  }
}
