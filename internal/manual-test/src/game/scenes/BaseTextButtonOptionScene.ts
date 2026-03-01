import { Text, TextButton } from "../components";
import { splitAndMapIntoPages } from "../utils";

export type TextButtonOptions = {
  perPage: number;
  align?: undefined | "left" | "right" | "center";
  list: {
    text: string | string[];
    onClick: () => void;
    style?: undefined | null | Phaser.Types.GameObjects.Text.TextStyle;
    tap?: undefined | ((obj: TextButton) => void);
  }[];
};

export abstract class BaseTextButtonOptionScene extends Phaser.Scene {
  abstract title(): string | string[];

  abstract options(): TextButtonOptions;

  create() {
    const viewPort = this.scale.getViewPort();

    const { align = "left", list, perPage } = this.options();

    const isMultiPages = list.length > perPage;

    const { pages, totalColumns, totalRows } = splitAndMapIntoPages(
      list,
      perPage,
      (
        { onClick, style, tap, text },
        { page, rowEntryCount, totalColumns, totalRows, x, y }
      ) => {
        const xPos = getHorizontalPosition(
          viewPort.width,
          x,
          totalColumns,
          rowEntryCount,
          align
        );

        const textObject = new TextButton(
          this,
          text,
          xPos,
          // we add 2, 1 for padding and another 1 for title
          (viewPort.height * (y + 2)) /
            (totalRows + 2 + (isMultiPages ? 1 : 0)),
          style
        )
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setVisible(page === 0) // initially show first page
          .on("pointerdown", onClick);

        tap?.(textObject);

        return this.add.existing(textObject);
      }
    );

    this.add
      .existing(
        new Text(
          this,
          this.title(),
          viewPort.centerX,
          viewPort.height / (totalRows + 2),
          {
            fontSize: "36px",
            fontStyle: "bold",
          }
        )
      )
      .setOrigin(0.5);

    if (isMultiPages) {
      this.add
        .existing(
          new TextButton(
            this,
            "Next >",
            (viewPort.width * totalColumns) / (totalColumns + 1),
            (viewPort.height * (totalRows + 2)) / (totalRows + 3)
          )
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setVisible(true)
        .on("pointerdown", () => {
          Phaser.Utils.Array.RotateLeft(pages, 1);

          pages.forEach((pageContent, pageNumber) =>
            pageContent.forEach((content) =>
              content.setVisible(pageNumber === 0)
            )
          );
        });
    }
  }
}

function getHorizontalPosition(
  width: number,
  colPos: number,
  totalColumns: number,
  rowEntryCount: number,
  align: TextButtonOptions["align"] & string
): number {
  switch (align) {
    case "left":
      return (width * (colPos + 1)) / (totalColumns + 1);
    case "right": {
      const offset = totalColumns - rowEntryCount;
      return (width * (offset + colPos + 1)) / (totalColumns + 1);
    }
    case "center": {
      const padColumn = totalColumns - rowEntryCount;
      const columnOffsetLeft = padColumn / 2;

      return (width * (colPos + columnOffsetLeft + 1)) / (totalColumns + 1);
    }
  }
}
