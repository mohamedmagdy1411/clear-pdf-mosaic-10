import React from 'react';
import { StickyNote, Languages, MessageSquareText } from "lucide-react";

interface Note {
  type: 'translation' | 'explanation';
  content: string;
}

interface PageNote {
  pageNumber: number;
  notes: Note[];
}

interface PDFNotesProps {
  currentNote?: PageNote;
  currentPage: number;
}

const PDFNotes = ({ currentNote, currentPage }: PDFNotesProps) => {
  if (!currentNote?.notes.length) return null;

  const getIcon = (type: Note['type']) => {
    switch (type) {
      case 'translation':
        return <Languages className="h-4 w-4 text-blue-600" />;
      case 'explanation':
        return <MessageSquareText className="h-4 w-4 text-green-600" />;
      default:
        return <StickyNote className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {currentNote.notes.map((note, index) => (
        <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            {getIcon(note.type)}
            <h3 className="font-medium text-yellow-800">
              {note.type === 'translation' ? 'الترجمة' : 'الشرح'} - صفحة {currentPage}
            </h3>
          </div>
          <p className="text-sm text-yellow-900 whitespace-pre-wrap">{note.content}</p>
        </div>
      ))}
    </div>
  );
};

export default PDFNotes;