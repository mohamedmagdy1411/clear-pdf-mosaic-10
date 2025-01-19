import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import PDFControls from './PDFControls';
import QuizModal from './QuizModal';
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

const PDFViewer = ({ url }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
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

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: { 
          text: pageText,
          action,
          options: {
            ...options,
            numberOfQuestions: options?.numberOfQuestions || 3,
            difficulty: options?.difficulty || 'medium'
          }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (action === 'quiz') {
        try {
          const questions = JSON.parse(data.result);
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
        title: `خطأ`,
        description: `حدث خطأ. برجاء المحاولة مرة أخرى`,
      });
    }
  };

  const handleTranslate = (language: string, instructions?: string) => 
    handleGeminiAction('translate', { language, instructions });
    
  const handleExplain = (style: string, instructions?: string) => 
    handleGeminiAction('explain', { style, instructions });
    
  const handleGenerateQuiz = () => handleGeminiAction('quiz');

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 pt-8 pb-24">
      <div className="max-w-5xl mx-auto px-4">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        )}
        
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            loading={null}
            className="shadow-md"
          />
        </Document>

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

        <Dialog open={showExplanationDialog} onOpenChange={setShowExplanationDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>الشرح</DialogTitle>
              <DialogDescription>
                {explanationContent}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PDFViewer;