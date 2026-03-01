import { splitEvery } from "ramda";

export function splitAndMapIntoPages<TValue, TResult>(
  values: TValue[],
  perPage: number,
  mapFn: (
    value: TValue,
    info: {
      page: number;
      x: number;
      y: number;
      totalRows: number;
      totalColumns: number;
      rowEntryCount: number;
    }
  ) => TResult
): {
  totalRows: number;
  totalColumns: number;
  pages: TResult[][];
} {
  const totalColumns = Math.ceil(Math.sqrt(perPage));
  const totalRows = Math.ceil(perPage / totalColumns);

  const pages = splitEvery(perPage)(values).map((pageContent, page) => {
    const lastRowEntryCount = pageContent.length % totalColumns || totalColumns;

    return pageContent.map((value, index) => {
      const x = index % totalColumns;
      const y = Math.floor(index / totalColumns);
      const rowEntryCount =
        y >= totalRows - 1 ? lastRowEntryCount : totalColumns;

      return mapFn(value, {
        page,
        rowEntryCount,
        totalColumns,
        totalRows,
        x,
        y,
      });
    });
  });

  return { pages, totalColumns, totalRows };
}
