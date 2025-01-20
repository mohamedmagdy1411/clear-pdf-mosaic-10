import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

async function generateGeminiResponse(text: string, action: string, options?: { language?: string, style?: string }) {
  let prompt = ''
  
  switch (action) {
    case 'translate':
      const targetLanguage = options?.language || 'English'
      prompt = `Translate the following text to ${targetLanguage}. Make sure to maintain the original meaning and context:\n\n${text}`
      break
    case 'explain':
      const style = options?.style || 'simple'
      let stylePrompt = ''
      switch (style) {
        case 'technical':
          stylePrompt = 'اشرح النص التالي بأسلوب تقني مع استخدام المصطلحات التخصصية والشرح المفصل'
          break
        case 'academic':
          stylePrompt = 'اشرح النص التالي بأسلوب أكاديمي رسمي مع ذكر المراجع إن وجدت'
          break
        case 'egyptian':
          stylePrompt = 'اشرح النص التالي باللهجة المصرية العامية بشكل مبسط ومفهوم'
          break
        case 'arabic_formal':
          stylePrompt = 'اشرح النص التالي باللغة العربية الفصحى بشكل رسمي ودقيق'
          break
        case 'simple':
        default:
          stylePrompt = 'اشرح النص التالي باللغة العربية بشكل مبسط يفهمه الجميع'
      }
      prompt = `${stylePrompt}:\n\n${text}`
      break
    case 'quiz':
      prompt = `قم بإنشاء 3 أسئلة اختيار من متعدد باللغة العربية بناءً على النص التالي. قم بتنسيق إجابتك كمصفوفة JSON بهذا الشكل بالضبط، بدون أي نص أو شرح إضافي:
[
  {
    "question": "نص السؤال هنا؟",
    "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
    "correctIndex": 0
  }
]
تأكد من:
- إنشاء 3 أسئلة بالضبط
- كل سؤال له 4 خيارات بالضبط
- correctIndex هو رقم (0-3) يشير إلى الخيار الصحيح
- الإجابة هي JSON صالح
هذا هو النص:\n\n${text}`
      break
    default:
      throw new Error('Invalid action')
  }

  console.log('Sending prompt to Gemini:', prompt)

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      throw new Error(`Gemini API error: ${error}`)
    }

    const data = await response.json()
    const result = data.candidates[0].content.parts[0].text

    if (action === 'quiz') {
      try {
        const cleanedResult = result.trim()
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        
        const parsed = JSON.parse(cleanedResult)
        
        if (!Array.isArray(parsed)) {
          console.error('Quiz response is not an array:', parsed)
          throw new Error('Quiz response is not an array')
        }
        
        if (parsed.length !== 3) {
          console.error('Quiz response does not contain exactly 3 questions:', parsed)
          throw new Error('Quiz must contain exactly 3 questions')
        }
        
        parsed.forEach((q, index) => {
          if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Invalid question format in question ${index + 1}`)
          }
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Question ${index + 1} must have exactly 4 options`)
          }
          if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
            throw new Error(`Invalid correctIndex in question ${index + 1}`)
          }
        })
        
        return JSON.stringify(parsed)
      } catch (e) {
        console.error('Quiz parsing error:', e, '\nRaw response:', result)
        throw new Error('Failed to parse quiz response: ' + e.message)
      }
    }

    return result
  } catch (error) {
    console.error('Error in generateGeminiResponse:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, action, options } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const result = await generateGeminiResponse(text, action, options)

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in gemini-ai function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})