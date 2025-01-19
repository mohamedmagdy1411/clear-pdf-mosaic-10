import { useState, useEffect } from "react";
import PDFViewer from "@/components/PDFViewer/PDFViewer";
import PDFUploader from "@/components/PDFUploader/PDFUploader";

const Index = () => {
  const [pdfUrl, setPdfUrl] = useState<string>(() => {
    const savedUrl = localStorage.getItem("pdf-url");
    return savedUrl || "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
  });

  const handleFileSelect = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
    localStorage.setItem("pdf-url", fileUrl);
  };

  useEffect(() => {
    localStorage.setItem("pdf-url", pdfUrl);
  }, [pdfUrl]);

  return (
    <div className="space-y-8">
      <PDFUploader onFileSelect={handleFileSelect} />
      <PDFViewer url={pdfUrl} />
    </div>
  );
};

export default Index;