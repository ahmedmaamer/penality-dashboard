import path from "path";
import { readFileSync } from "fs";
import * as XLSX from "xlsx";

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "public", "PENALTY.xlsx");
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (raw rows)
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    // Find the header row (contains "NOM" or "Nom")
    let headerRowIndex = -1;
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (row.some((cell) => String(cell).toUpperCase() === "NOM")) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return res.status(400).json({ error: "Could not find header row with 'NOM'" });
    }

    const headerRow = rawRows[headerRowIndex];

    // Identify test columns (numeric headers between NOM and % columns)
    const nomIndex = headerRow.findIndex((h) => String(h).toUpperCase() === "NOM");
    const testColumns = [];

    for (let i = nomIndex + 1; i < headerRow.length; i++) {
      const header = String(headerRow[i]).trim();
      // Skip percentage columns and empty headers
      if (header.includes("%") || header === "") continue;
      testColumns.push({ index: i, label: `T${testColumns.length + 1}` });
    }

    // Parse player rows (all rows after header that have a name)
    const players = [];
    for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      const name = String(row[nomIndex] || "").trim();
      if (!name) continue;

      const results = testColumns.map((col) => {
        const val = row[col.index];
        const num = parseInt(val, 10);
        return isNaN(num) ? null : num;
      });

      const validResults = results.filter((v) => v !== null);
      const scored = validResults.filter((v) => v === 1).length;
      const missed = validResults.filter((v) => v === 0).length;
      const total = validResults.length;

      players.push({
        name,
        results,
        scored,
        missed,
        total,
        pctScored: total > 0 ? Math.round((scored / total) * 100) : 0,
        pctMissed: total > 0 ? Math.round((missed / total) * 100) : 0,
      });
    }

    const testLabels = testColumns.map((col) => col.label);

    res.status(200).json({ players, testLabels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read Excel file: " + err.message });
  }
}
