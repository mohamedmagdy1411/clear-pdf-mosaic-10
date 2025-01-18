import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import PDFControls from './PDFControls';
import { supabase } from "@/integrations/supabase/client";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

const PDFViewer = ({ url }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

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

  const handleZoomIn = () => setScale(prev => Math.min(2, prev + 0.1));
  const handleZoomOut = () => setScale(prev => Math.max(0.5, prev - 0.1));

  const getPageText = async (pageNum: number): Promise<string | null> => {
    try {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      console.log('Extracted text:', text.substring(0, 100) + '...'); // Log first 100 chars
      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      return null;
    }
  };

  const handleTranslate = async () => {
    try {
      const pageText = await getPageText(currentPage);
      if (!pageText) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not extract text from this page.",
        });
        return;
      }

      console.log('Sending text for translation...');
      const { data, error } = await supabase.functions.invoke('google-ai', {
        body: { text: pageText, action: 'translate', targetLanguage: 'en' }
      });

      console.log('Translation response:', data);

      if (error) {
        console.error('Translation error:', error);
        throw error;
      }

      if (!data?.data?.translations?.[0]?.translatedText) {
        throw new Error('Invalid translation response');
      }

      toast({
        title: "Translation",
        description: data.data.translations[0].translatedText,
        duration: 10000,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        variant: "destructive",
        title: "Translation Error",
        description: "Could not translate the text. Please try again later.",
      });
    }
  };

  const handleExplain = async () => {
    try {
      const pageText = await getPageText(currentPage);
      if (!pageText) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not extract text from this page.",
        });
        return;
      }

      console.log('Sending text for analysis...');
      const { data, error } = await supabase.functions.invoke('google-ai', {
        body: { text: pageText, action: 'analyze' }
      });

      console.log('Analysis response:', data);

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (!data?.entities?.length) {
        throw new Error('No entities found in the analysis');
      }

      const entities = data.entities.map((entity: any) => 
        `${entity.name} (${entity.type})`
      ).join(', ');

      toast({
        title: "Key Concepts",
        description: `Main entities found: ${entities}`,
        duration: 10000,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Could not analyze the text. Please try again later.",
      });
    }
  };

  const handleGenerateQuiz = () => {
    toast({
      title: "Quiz Generation",
      description: `Generating quiz for page ${currentPage}... This feature will be available soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-8 pb-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 min-h-[calc(100vh-16rem)] flex flex-col items-center">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
        </div>
      </div>

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
        />
      )}
    </div>
  );
};

export default PDFViewer;