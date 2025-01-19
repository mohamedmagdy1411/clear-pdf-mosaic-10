import React from 'react';
import { Document, Page } from 'react-pdf';

interface PDFDocumentProps {
  url: string;
  currentPage: number;
  scale: number;
  isLoading: boolean;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
}

const PDFDocument = ({
  url,
  currentPage,
  scale,
  isLoading,
  onLoadSuccess,
  onLoadError
}: PDFDocumentProps) => {
  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      )}
      
      <Document
        file={url}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={null}
      >
        <Page
          pageNumber={currentPage}
          scale={scale}
          loading={null}
          className="shadow-md"
        />
      </Document>
    </>
  );
};

export default PDFDocument;