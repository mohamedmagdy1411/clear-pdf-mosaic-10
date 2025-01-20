import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import PDFControls from './PDFControls';
import QuizModal from './QuizModal';
import PDFDocument from './PDFDocument';
import PDFNotes from './PDFNotes';
import ExplanationDialog from './ExplanationDialog';
import { supabase } from "@/integrations/supabase/client";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface Note {
  type: 'translation' | 'explanation';
  content: string;
}

interface PageNote {
  pageNumber: number;
  notes: Note[];
}

interface PDFState {
  currentPage: number;
  scale: number;
  pageNotes: PageNote[];
}

const PDFViewer = ({ url }: PDFViewerProps) => {
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
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [explanationContent, setExplanationContent] = useState("");
  const [quizSettings, setQuizSettings] = useState({
    numberOfQuestions: 3,
    difficulty: 'medium'
  });
  const [pageNotes, setPageNotes] = useState<PageNote[]>(() => {
    const savedState = localStorage.getItem(`pdf-state-${url}`);
    return savedState ? JSON.parse(savedState).pageNotes : [];
  });

  // Save PDF state to localStorage whenever it changes
  useEffect(() => {
    const state: PDFState = {
      currentPage,
      scale,
      pageNotes
    };
    localStorage.setItem(`pdf-state-${url}`, JSON.stringify(state));
  }, [currentPage, scale, pageNotes, url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setIsLoading(false);
    toast({
      variant: "destructive",
      title: "Error loading PDF",
      description: "Please try again later or check if the file is valid.",
    });
    console.error('Error loading PDF:', error);
  };

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

  const handleGeminiAction = async (action: 'translate' | 'explain' | 'quiz', options?: { 
    language?: string, 
    style?: string,
    instructions?: string,
    numberOfQuestions?: number,
    difficulty?: string
  }) => {
    try {
      const pageText = await getPageText(currentPage);
      
      if (!pageText) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم نتمكن من استخراج النص من هذه الصفحة",
        });
        return;
      }

      console.log('Sending request with options:', options);

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: { 
          text: pageText,
          action,
          options: {
            ...options,
            numberOfQuestions: options?.numberOfQuestions || quizSettings.numberOfQuestions,
            difficulty: options?.difficulty || quizSettings.difficulty
          }
        }
      });

      if (error) throw error;

      if (action === 'quiz') {
        try {
          const questions = JSON.parse(data.result);
          console.log('Parsed quiz questions:', questions);
          setQuizQuestions(questions);
          setIsQuizModalOpen(true);
        } catch (e) {
          console.error('Quiz parsing error:', e);
          toast({
            variant: "destructive",
            title: "خطأ في إنشاء الاختبار",
            description: "برجاء المحاولة مرة أخرى",
          });
        }
      } else {
        setExplanationContent(data.result);
        setShowExplanationDialog(true);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ. برجاء المحاولة مرة أخرى",
      });
    }
  };

  const handleSaveContent = () => {
    const element = document.createElement("a");
    const file = new Blob([explanationContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "content.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveNote = () => {
    const newNote: Note = {
      type: 'explanation',
      content: explanationContent
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
      description: `تم حفظ الشرح كملاحظة للصفحة ${currentPage}`,
    });
  };

  const handleTranslationNote = (translationContent: string) => {
    const newNote: Note = {
      type: 'translation',
      content: translationContent
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
      description: `تم حفظ الترجمة كملاحظة للصفحة ${currentPage}`,
    });
  };

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

  const handleTranslate = (language: string, instructions?: string) => 
    handleGeminiAction('translate', { language, instructions });
    
  const handleExplain = (style: string, instructions?: string) => {
    const arabicInstructions = 'اشرح هذا النص باللغة العربية بشكل مفصل ومفهوم';
    handleGeminiAction('explain', { instructions: arabicInstructions });
  };
    
  const handleGenerateQuiz = () => {
    handleGeminiAction('quiz', {
      numberOfQuestions: quizSettings.numberOfQuestions,
      difficulty: quizSettings.difficulty
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSelectedTextTranslate = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: { 
          text,
          action: 'translate',
          options: {
            language: 'Arabic'
          }
        }
      });

      if (error) throw error;

      setExplanationContent(data.result);
      setShowExplanationDialog(true);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في الترجمة",
        description: "حدث خطأ أثناء ترجمة النص. يرجى المحاولة مرة أخرى.",
      });
    }
  };

  const handleSelectedTextExplain = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: { 
          text,
          action: 'explain',
          options: {
            style: 'simple'
          }
        }
      });

      if (error) throw error;

      setExplanationContent(data.result);
      setShowExplanationDialog(true);
    } catch (error) {
      console.error('Explanation error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في الشرح",
        description: "حدث خطأ أثناء شرح النص. يرجى المحاولة مرة أخرى.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-8 pb-24">
      <div className="max-w-5xl mx-auto px-4">
        <PDFDocument
          url={url}
          currentPage={currentPage}
          scale={scale}
          isLoading={isLoading}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onTranslate={handleSelectedTextTranslate}
          onExplain={handleSelectedTextExplain}
        />

        <PDFNotes
          currentNote={getCurrentPageNote()}
          currentPage={currentPage}
        />

        {numPages > 0 && (
          <PDFControls
            numPages={numPages}
            currentPage={currentPage}
            scale={scale}
            onPageChange={handlePageChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onTranslate={handleTranslate}
            onExplain={handleExplain}
            onGenerateQuiz={handleGenerateQuiz}
            quizSettings={quizSettings}
            onQuizSettingsChange={setQuizSettings}
          />
        )}

        <QuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          questions={quizQuestions}
        />

        <ExplanationDialog
          isOpen={showExplanationDialog}
          onOpenChange={setShowExplanationDialog}
          content={explanationContent}
          onSaveContent={handleSaveContent}
          onSaveNote={handleSaveNote}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
