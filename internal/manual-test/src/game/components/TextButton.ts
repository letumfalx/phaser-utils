import { Text } from "./Text";

export class TextButton extends Text {
  protected eventStyleHandlers: Record<string, () => void> = {};

  constructor(
    scene: Phaser.Scene,
    text: string | string[],
    x = 0,
    y = 0,
    style: undefined | null | Phaser.Types.GameObjects.Text.TextStyle = {}
  ) {
    super(scene, text, x, y, {
      color: "#FFFFFF",
      fontFamily: "sans-serif",
      fontSize: "24px",
      padding: {
        x: 16,
        y: 8,
      },
      ...style,
    });

    this.setEventStyle("pointerover", {
      backgroundColor: "#FFFFFF88",
    })
      .setEventStyle("pointerout", {
        backgroundColor: style?.backgroundColor,
      })
      .toggleInteractive(true);
  }

  setEventStyle(
    event: "pointerover" | "pointerout" | "pointerdown" | "pointerup",
    style: null | Phaser.Types.GameObjects.Text.TextStyle
  ): this {
    const handler = this.eventStyleHandlers[event];
    if (handler) {
      this.off(event, handler);
    }

    if (style) {
      this.on(
        event,
        (this.eventStyleHandlers[event] = () => {
          this.setStyle(style);
        })
      );
    } else {
      delete this.eventStyleHandlers[event];
    }

    return this;
  }

  toggleInteractive(enable: boolean): this {
    if (enable) {
      this.setInteractive({ useHandCursor: true });
    } else {
      this.disableInteractive();
    }

    return this;
  }
}
