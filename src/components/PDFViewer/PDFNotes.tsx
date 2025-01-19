import React from 'react';
import { Bookmark } from "lucide-react";

interface PageNote {
  pageNumber: number;
  content: string;
}

interface PDFNotesProps {
  currentNote?: PageNote;
  currentPage: number;
}

const PDFNotes = ({ currentNote, currentPage }: PDFNotesProps) => {
  if (!currentNote) return null;

  return (
    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="h-4 w-4 text-yellow-600" />
        <h3 className="font-medium text-yellow-800">ملاحظات الصفحة {currentPage}</h3>
      </div>
      <p className="text-sm text-yellow-900">{currentNote.content}</p>
    </div>
  );
};

export default PDFNotes;