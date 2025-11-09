import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AVAILABLE_ICONS = [
  'briefcase', 'clipboard', 'file-text', 'folder', 'inbox', 'send', 'archive',
  'trending-up', 'target', 'award', 'check-circle', 'list-checks',
  'phone', 'mail', 'message-circle', 'users', 'video', 'mic', 'headphones',
  'calendar', 'clock', 'alarm-clock', 'timer', 'hourglass',
  'palette', 'pen-tool', 'edit', 'image', 'camera', 'film', 'music', 'brush', 'pipette',
  'book-open', 'graduation-cap', 'lightbulb', 'brain', 'bookmark',
  'calculator', 'flask-conical', 'atom', 'microscope', 'book', 'languages', 'library',
  'heart', 'activity', 'dumbbell', 'bike', 'apple', 'pill', 'footprints',
  'shopping-cart', 'shopping-bag', 'credit-card', 'dollar-sign', 'wallet',
  'package', 'truck', 'store',
  'home', 'coffee', 'utensils', 'dog', 'cat', 'car', 'plane',
  'umbrella', 'gift', 'cake', 'shirt', 'bed', 'lamp',
  'laptop', 'smartphone', 'wifi', 'battery', 'plug', 'wrench',
  'settings', 'code', 'terminal', 'database', 'server', 'bug',
  'sun', 'moon', 'cloud', 'zap', 'droplet', 'leaf', 'flower', 'tree', 'waves',
  'pizza', 'cup', 'beer', 'wine', 'egg', 'soup',
  'gamepad', 'trophy', 'star', 'sparkles', 'party-popper', 'guitar', 'dice',
  'map-pin', 'compass', 'navigation', 'map', 'milestone',
  'file', 'save', 'download', 'upload', 'paperclip', 'newspaper',
  'bell', 'alert-triangle', 'alert-circle', 'info', 'help-circle',
  'plus', 'minus', 'x', 'check', 'arrow-right', 'refresh',
  'search', 'filter', 'trash', 'eye', 'lock', 'unlock',
];

async function suggestIcon(taskName: string, taskDescription: string): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    return 'circle';
  }

  const prompt = `You are an expert icon selector for a task management app. Analyze the task and select THE MOST SPECIFIC icon that represents it.

AVAILABLE ICONS:
${AVAILABLE_ICONS.join(', ')}

TASK TO ANALYZE:
Name: "${taskName}"
Description: "${taskDescription || 'No description'}"

SELECTION RULES (CRITICAL):
1. BE SPECIFIC - Choose the most precise icon for the subject/action
2. Subject-specific icons ALWAYS beat generic ones:
   - "math" → use "calculator" NOT "brain" or "book-open"
   - "science" → use "flask-conical", "atom", or "microscope" NOT "brain"
   - "reading" → use "book" NOT "book-open"
   - "coding" → use "code" or "terminal" NOT "laptop"
   - "exercise" → use "dumbbell" or "activity" NOT "heart"
3. Look for keywords that match specific icons
4. If task mentions multiple topics, pick the PRIMARY focus
5. Only use generic icons (clipboard, check-circle) if NO specific match exists

EXAMPLES OF GOOD CHOICES:
- "Study math homework" → calculator
- "Science lab report" → flask-conical
- "Physics problem set" → atom
- "Biology reading" → microscope
- "Read chapter 5" → book
- "Spanish vocab practice" → languages
- "Write code for app" → code
- "Grocery shopping" → shopping-cart
- "Workout at gym" → dumbbell
- "Team meeting" → users
- "Call dentist" → phone

RETURN ONLY THE ICON NAME (one word, lowercase, with hyphens if needed). NO other text.

Icon name:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 20,
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return 'circle';
    }

    const data = await response.json();
    const iconName = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || 'circle';
    
    if (AVAILABLE_ICONS.includes(iconName)) {
      return iconName;
    } else {
      return 'check-circle';
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'circle';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { taskName, taskDescription, taskId } = await req.json()

    if (!taskName) {
      return new Response(
        JSON.stringify({ error: 'taskName is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const iconName = await suggestIcon(taskName, taskDescription || '');

    if (taskId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: req.headers.get('Authorization')! },
          },
        }
      )

      await supabaseClient
        .from('tasks')
        .update({ icon_name: iconName })
        .eq('id', taskId)
    }

    return new Response(
      JSON.stringify({ iconName }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, iconName: 'circle' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

