import React, { useState, useCallback } from "react";
import { Language } from "../types";
import { translations } from "../i18n";
import {
  ArrowLeft,
  Plus,
  Download,
  Save,
  Table as TableIcon,
} from "lucide-react";

interface Props {
  lang: Language;
  onBack: () => void;
  initialData?: any;
  onSaveNote?: (title: string, data: any) => void;
}

const ROWS = 50;
const COLS = 26; // A-Z

export function SpreadsheetsApp({
  lang,
  onBack,
  initialData,
  onSaveNote,
}: Props) {
  const [data, setData] = useState<Record<string, string>>(initialData || {});
  const [activeCell, setActiveCell] = useState<string | null>(null);

  const getColLabel = (index: number) => String.fromCharCode(65 + index);

  const handleCellChange = (cellId: string, value: string) => {
    setData((prev) => ({ ...prev, [cellId]: value }));
  };

  const getCellValue = (cellId: string) => data[cellId] || "";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 w-full relative">
      <header className="p-2 sm:p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-green-600">
            <TableIcon className="w-6 h-6" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white hidden sm:block">
              {lang === "ar" ? "جداول البيانات" : "Spreadsheets"}
            </h2>
          </div>
        </div>
        {onSaveNote && (
          <button
            onClick={() =>
              onSaveNote(lang === "ar" ? "جدول بيانات" : "Spreadsheet", data)
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Save className="w-4 h-4" />
            <span>{lang === "ar" ? "حفظ" : "Save"}</span>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-950 relative">
        <div className="inline-block min-w-full">
          <table className="w-max border-collapse bg-white dark:bg-neutral-900">
            <thead>
              <tr>
                <th className="w-10 h-8 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 sticky top-0 left-0 z-20"></th>
                {Array.from({ length: COLS }).map((_, i) => (
                  <th
                    key={`col-${i}`}
                    className="min-w-[100px] border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-normal text-sm sticky top-0 z-10 select-none"
                  >
                    {getColLabel(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }).map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  <td className="w-10 h-8 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-center font-normal text-sm sticky left-0 z-10 select-none">
                    {rowIndex + 1}
                  </td>
                  {Array.from({ length: COLS }).map((_, colIndex) => {
                    const cellId = `${getColLabel(colIndex)}${rowIndex + 1}`;
                    const isActive = activeCell === cellId;
                    return (
                      <td
                        key={cellId}
                        className={`border border-neutral-300 dark:border-neutral-700 p-0 relative ${isActive ? "outline-2 outline-blue-500 outline z-10" : ""}`}
                        onClick={() => setActiveCell(cellId)}
                      >
                        <input
                          type="text"
                          value={getCellValue(cellId)}
                          onChange={(e) =>
                            handleCellChange(cellId, e.target.value)
                          }
                          onFocus={() => setActiveCell(cellId)}
                          className="w-full h-full px-1 text-sm bg-transparent outline-none text-neutral-900 dark:text-neutral-100 focus:bg-white dark:focus:bg-neutral-800"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
