import { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';

interface PDFState {
  currentPage: number;
  scale: number;
  pageNotes: PageNote[];
}

interface Note {
  type: 'translation' | 'explanation';
  content: string;
}

interface PageNote {
  pageNumber: number;
  notes: Note[];
}

export const usePDFState = (url: string) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const savedState = localStorage.getItem(`pdf-state-${url}`);
    return savedState ? JSON.parse(savedState).currentPage : 1;
  });
  const [scale, setScale] = useState<number>(() => {
    const savedState = localStorage.getItem(`pdf-state-${url}`);
    return savedState ? JSON.parse(savedState).scale : 1;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const state: PDFState = {
      currentPage,
      scale,
      pageNotes: []
    };
    localStorage.setItem(`pdf-state-${url}`, JSON.stringify(state));
  }, [currentPage, scale, url]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(2, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.1));
  };

  const getPageText = async (pageNum: number): Promise<string | null> => {
    try {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      return null;
    }
  };

  return {
    numPages,
    setNumPages,
    currentPage,
    setCurrentPage,
    scale,
    isLoading,
    setIsLoading,
    handleZoomIn,
    handleZoomOut,
    getPageText
  };
};