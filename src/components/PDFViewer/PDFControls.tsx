import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Languages,
  MessageSquareText,
  BrainCircuit,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PDFControlsProps {
  numPages: number;
  currentPage: number;
  scale: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTranslate: (language: string) => void;
  onExplain: (style: string) => void;
  onGenerateQuiz: () => void;
}

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
  'Russian',
  'Arabic',
  'Hindi'
];

const EXPLANATION_STYLES = [
  { label: 'Simple', value: 'simple' },
  { label: 'Technical', value: 'technical' },
  { label: 'Academic', value: 'academic' },
];

const PDFControls = ({
  numPages,
  currentPage,
  scale,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onTranslate,
  onExplain,
  onGenerateQuiz
}: PDFControlsProps) => {
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= numPages) {
      onPageChange(value);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={handlePageInput}
              className="w-16 text-center"
            />
            <span className="text-sm text-gray-500">of {numPages}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Languages className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Translate this page</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => onTranslate(lang)}>
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MessageSquareText className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get an explanation</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {EXPLANATION_STYLES.map((style) => (
                <DropdownMenuItem key={style.value} onClick={() => onExplain(style.value)}>
                  {style.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onGenerateQuiz}>
                <BrainCircuit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate interactive quiz</p>
            </TooltipContent>
          </Tooltip>

          <div className="border-l border-gray-200 mx-2 h-6" />

          <Button
            variant="outline"
            size="icon"
            onClick={onZoomOut}
            disabled={scale <= 0.5}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500 w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomIn}
            disabled={scale >= 2}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFControls;