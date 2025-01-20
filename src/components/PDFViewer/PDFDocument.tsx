import React from 'react';
import { Document, Page } from 'react-pdf';
import { Skeleton } from "@/components/ui/skeleton";
import TextSelectionMenu from './TextSelectionMenu';
import { useToast } from "@/hooks/use-toast";

interface PDFDocumentProps {
  url: string;
  currentPage: number;
  scale: number;
  isLoading: boolean;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  onTranslate?: (text: string) => void;
  onExplain?: (text: string) => void;
}

const PDFDocument = ({
  url,
  currentPage,
  scale,
  isLoading,
  onLoadSuccess,
  onLoadError,
  onTranslate,
  onExplain
}: PDFDocumentProps) => {
  const { toast } = useToast();

  const handleContextMenuAction = (action: string) => {
    const selectedText = window.getSelection()?.toString();
    if (!selectedText) {
      toast({
        title: "لم يتم تحديد نص",
        description: "يرجى تحديد النص أولاً",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case 'translate':
        onTranslate?.(selectedText);
        break;
      case 'explain':
        onExplain?.(selectedText);
        break;
      case 'search':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, '_blank');
        break;
      case 'note':
        // TODO: Implement note functionality
        toast({
          title: "إضافة ملاحظة",
          description: "سيتم تنفيذ هذه الميزة قريباً",
        });
        break;
      case 'highlight':
        // TODO: Implement highlight functionality
        toast({
          title: "تلوين النص",
          description: "سيتم تنفيذ هذه الميزة قريباً",
        });
        break;
    }
  };

  return (
    <div className="flex justify-center">
      <TextSelectionMenu
        onTranslate={() => handleContextMenuAction('translate')}
        onExplain={() => handleContextMenuAction('explain')}
        onSearch={() => handleContextMenuAction('search')}
        onAddNote={() => handleContextMenuAction('note')}
        onHighlight={() => handleContextMenuAction('highlight')}
      >
        <Document
          file={url}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={
            <div className="w-full max-w-3xl">
              <Skeleton className="h-[842px] w-full" />
            </div>
          }
        >
          {isLoading ? (
            <div className="w-full max-w-3xl">
              <Skeleton className="h-[842px] w-full" />
            </div>
          ) : (
            <Page
              pageNumber={currentPage}
              scale={scale}
              loading={
                <div className="w-full max-w-3xl">
                  <Skeleton className="h-[842px] w-full" />
                </div>
              }
            />
          )}
        </Document>
      </TextSelectionMenu>
    </div>
  );
};

export default PDFDocument;