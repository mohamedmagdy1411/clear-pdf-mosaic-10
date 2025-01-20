import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Languages,
  MessageSquareText,
  Search,
  StickyNote,
  Highlighter
} from "lucide-react";

interface TextSelectionMenuProps {
  children: React.ReactNode;
  onTranslate: () => void;
  onExplain: () => void;
  onSearch: () => void;
  onAddNote: () => void;
  onHighlight: () => void;
}

const TextSelectionMenu = ({
  children,
  onTranslate,
  onExplain,
  onSearch,
  onAddNote,
  onHighlight
}: TextSelectionMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={onTranslate} className="gap-2">
          <Languages className="h-4 w-4" />
          <span>ترجمة النص</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onExplain} className="gap-2">
          <MessageSquareText className="h-4 w-4" />
          <span>شرح النص</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSearch} className="gap-2">
          <Search className="h-4 w-4" />
          <span>بحث في جوجل</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onAddNote} className="gap-2">
          <StickyNote className="h-4 w-4" />
          <span>إضافة ملاحظة</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onHighlight} className="gap-2">
          <Highlighter className="h-4 w-4" />
          <span>تلوين النص</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TextSelectionMenu;