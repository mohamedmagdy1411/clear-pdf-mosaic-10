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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>الشرح</DialogTitle>
          <DialogDescription>
            {content}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2">
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