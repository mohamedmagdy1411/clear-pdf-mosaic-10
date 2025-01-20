import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizSettings {
  numberOfQuestions: number;
  difficulty: string;
}

export const useGeminiActions = (quizSettings: QuizSettings) => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [explanationContent, setExplanationContent] = useState("");
  const { toast } = useToast();

  const handleGeminiAction = async (action: 'translate' | 'explain' | 'quiz', pageText: string, options?: { 
    language?: string, 
    style?: string,
    instructions?: string,
    numberOfQuestions?: number,
    difficulty?: string
  }) => {
    try {
      if (!pageText) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم نتمكن من استخراج النص من هذه الصفحة",
        });
        return;
      }

      console.log('Sending request with options:', options);

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: { 
          text: pageText,
          action,
          options: {
            ...options,
            numberOfQuestions: options?.numberOfQuestions || quizSettings.numberOfQuestions,
            difficulty: options?.difficulty || quizSettings.difficulty
          }
        }
      });

      if (error) throw error;

      if (action === 'quiz') {
        try {
          const questions = JSON.parse(data.result);
          console.log('Parsed quiz questions:', questions);
          setQuizQuestions(questions);
          setIsQuizModalOpen(true);
        } catch (e) {
          console.error('Quiz parsing error:', e);
          toast({
            variant: "destructive",
            title: "خطأ في إنشاء الاختبار",
            description: "برجاء المحاولة مرة أخرى",
          });
        }
      } else {
        setExplanationContent(data.result);
        setShowExplanationDialog(true);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ. برجاء المحاولة مرة أخرى",
      });
    }
  };

  return {
    quizQuestions,
    isQuizModalOpen,
    setIsQuizModalOpen,
    showExplanationDialog,
    setShowExplanationDialog,
    explanationContent,
    handleGeminiAction
  };
};