import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Bookmark } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExplanationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onSaveContent: () => void;
  onSaveNote: () => void;
}

const ExplanationDialog = ({
  isOpen,
  onOpenChange,
  content,
  onSaveContent,
  onSaveNote
}: ExplanationDialogProps) => {
  // Function to format the content with proper line breaks
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-right">الشرح</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[50vh] w-full rounded-md border p-4">
          <DialogDescription className="text-right whitespace-pre-wrap leading-relaxed">
            {formatContent(content)}
          </DialogDescription>
        </ScrollArea>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-start">
          <Button onClick={onSaveContent} className="gap-2">
            <Download className="h-4 w-4" />
            حفظ كملف
          </Button>
          <Button onClick={onSaveNote} variant="secondary" className="gap-2">
            <Bookmark className="h-4 w-4" />
            حفظ كملاحظة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExplanationDialog;