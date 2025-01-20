import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, Languages, MessageSquareText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExplanationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onSaveContent: () => void;
  onSaveNote: () => void;
  type?: 'translation' | 'explanation';
}

const ExplanationDialog = ({
  isOpen,
  onOpenChange,
  content,
  onSaveContent,
  onSaveNote,
  type = 'explanation'
}: ExplanationDialogProps) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange} side="left">
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto" side="left">
        <SheetHeader>
          <SheetTitle className="text-right">
            {type === 'translation' ? 'الترجمة' : 'الشرح'}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] mt-6 w-full rounded-md border p-4">
          <div className="text-right whitespace-pre-wrap leading-relaxed">
            {formatContent(content)}
          </div>
        </ScrollArea>
        <div className="mt-6 flex gap-2 justify-end">
          <Button onClick={onSaveContent} className="gap-2">
            <Download className="h-4 w-4" />
            حفظ كملف
          </Button>
          <Button onClick={onSaveNote} variant="secondary" className="gap-2">
            {type === 'translation' ? (
              <Languages className="h-4 w-4" />
            ) : (
              <MessageSquareText className="h-4 w-4" />
            )}
            حفظ كملاحظة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExplanationDialog;