import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface Note {
  type: 'translation' | 'explanation';
  content: string;
}

interface PageNote {
  pageNumber: number;
  notes: Note[];
}

export const useNotes = (url: string, currentPage: number) => {
  const [pageNotes, setPageNotes] = useState<PageNote[]>(() => {
    const savedState = localStorage.getItem(`pdf-state-${url}`);
    return savedState ? JSON.parse(savedState).pageNotes : [];
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedNotes = localStorage.getItem(`pdf-notes-${url}`);
    if (savedNotes) {
      setPageNotes(JSON.parse(savedNotes));
    }
  }, [url]);

  useEffect(() => {
    localStorage.setItem(`pdf-notes-${url}`, JSON.stringify(pageNotes));
  }, [pageNotes, url]);

  const getCurrentPageNote = () => {
    return pageNotes.find(note => note.pageNumber === currentPage);
  };

  const handleSaveNote = (content: string, type: 'translation' | 'explanation' = 'explanation') => {
    const newNote: Note = {
      type,
      content
    };
    
    setPageNotes(prev => {
      const existingPageNoteIndex = prev.findIndex(note => note.pageNumber === currentPage);
      
      if (existingPageNoteIndex >= 0) {
        const updatedNotes = [...prev];
        updatedNotes[existingPageNoteIndex] = {
          ...updatedNotes[existingPageNoteIndex],
          notes: [...updatedNotes[existingPageNoteIndex].notes, newNote]
        };
        return updatedNotes;
      }
      
      return [...prev, { pageNumber: currentPage, notes: [newNote] }];
    });

    toast({
      title: "تم حفظ الملاحظة",
      description: `تم حفظ ${type === 'translation' ? 'الترجمة' : 'الشرح'} كملاحظة للصفحة ${currentPage}`,
    });
  };

  return {
    pageNotes,
    getCurrentPageNote,
    handleSaveNote
  };
};