/**
 * Client-side CSV export (opens directly in Excel / Google Sheets).
 *
 * Security: guards against CSV/formula injection. A cell whose text begins with
 * =, +, -, @, or a control char can be interpreted as a formula by spreadsheet
 * apps; we neutralise those by prefixing a single quote. Values are also RFC-4180
 * quoted so commas, quotes, and newlines never break the layout.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

function sanitizeCell(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return '';
  let str = String(raw);
  if (str.length > 0 && FORMULA_PREFIXES.includes(str[0])) {
    str = `'${str}`;
  }
  // RFC-4180 quoting: wrap in quotes and double any embedded quotes.
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Build CSV text (with a UTF-8 BOM so Excel renders non-ASCII correctly). */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => sanitizeCell(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => sanitizeCell(c.value(row))).join(','))
    .join('\r\n');
  return `\uFEFF${header}\r\n${body}`;
}

/** Trigger a browser download of the given rows as a CSV file. */
export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  const csv = toCsv(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Append a YYYY-MM-DD stamp to an export base name, e.g. "employers-2026-07-11". */
export function stampedFilename(base: string): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
  return `${base}-${stamp}`;
}
