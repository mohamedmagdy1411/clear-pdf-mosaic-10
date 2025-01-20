import React, { useState } from 'react';
import { pdfjs } from 'react-pdf';
import PDFControls from './PDFControls';
import QuizModal from './QuizModal';
import PDFDocument from './PDFDocument';
import PDFNotes from './PDFNotes';
import ExplanationDialog from './ExplanationDialog';
import { useGeminiActions } from './hooks/useGeminiActions';
import { usePDFState } from './hooks/usePDFState';
import { useNotes } from './hooks/useNotes';
import { toast } from "@/hooks/use-toast";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

const PDFViewer = ({ url }: PDFViewerProps) => {
  const [quizSettings, setQuizSettings] = useState({
    numberOfQuestions: 3,
    difficulty: 'medium'
  });

  const {
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
  } = usePDFState(url);

  const {
    quizQuestions,
    isQuizModalOpen,
    setIsQuizModalOpen,
    showExplanationDialog,
    setShowExplanationDialog,
    explanationContent,
    handleGeminiAction
  } = useGeminiActions(quizSettings);

  const {
    getCurrentPageNote,
    handleSaveNote
  } = useNotes(url, currentPage);

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

  const handleTranslate = async (language: string, instructions?: string) => {
    const pageText = await getPageText(currentPage);
    if (pageText) {
      handleGeminiAction('translate', pageText, { language, instructions });
    }
  };

  const handleExplain = async (style: string, instructions?: string) => {
    const pageText = await getPageText(currentPage);
    if (pageText) {
      const arabicInstructions = 'اشرح هذا النص باللغة العربية بشكل مفصل ومفهوم';
      handleGeminiAction('explain', pageText, { instructions: arabicInstructions });
    }
  };

  const handleGenerateQuiz = async () => {
    const pageText = await getPageText(currentPage);
    if (pageText) {
      handleGeminiAction('quiz', pageText, {
        numberOfQuestions: quizSettings.numberOfQuestions,
        difficulty: quizSettings.difficulty
      });
    }
  };

  const handleSelectedTextTranslate = async (text: string) => {
    handleGeminiAction('translate', text, { language: 'Arabic' });
  };

  const handleSelectedTextExplain = async (text: string) => {
    handleGeminiAction('explain', text, { 
      instructions: 'اشرح هذا النص باللغة العربية بشكل مفصل ومفهوم'
    });
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
            onPageChange={setCurrentPage}
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
          onSaveNote={() => handleSaveNote(explanationContent)}
        />
      </div>
    </div>
  );
};

export default PDFViewer;