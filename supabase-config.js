// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// আপনার Supabase credentials এখানে বসাবেন
const supabaseUrl = 'YOUR_SUPABASE_URL_WILL_BE_HERE'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_WILL_BE_HERE'

// Supabase client তৈরি করুন
export const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Supabase configured successfully!')
