import * as fs from "fs";
import { parse } from "csv-parse/sync";

export class CityRow {
  constructor(
    public query: string,
    public expectedCountry: string,
    public forecastDays: number
  ) {}
}

export class CsvDataLoader {
  static load(filename: string): CityRow[] {
    try {
      const csvPath = `src/helper/util/testData/${filename}`;
      const fileContent = fs.readFileSync(csvPath, "utf-8");

      const records: string[][] = parse(fileContent, {
        skip_empty_lines: true,
      });

      const rows: CityRow[] = [];
      let header = true;

      for (const row of records) {
        if (header) {
          header = false;
          continue;
        }
        const query = row[0]?.trim() ?? "";
        const expectedCountry = row[1]?.trim() ?? "";
        const days = parseInt(row[2]?.trim() ?? "0", 10);

        rows.push(new CityRow(query, expectedCountry, days));
      }

      return rows;
    } catch (err) {
      throw new Error(`Failed to read CSV: ${filename}, ${(err as Error).message}`);
    }
  }
}
