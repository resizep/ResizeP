// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// আপনার Supabase credentials এখানে বসাবেন
// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// আপনার Supabase credentials
const supabaseUrl = 'https://ladhheflyezeuigdvpml.supabase.co'
const supabaseKey = 'eyJhhb6c1013TUzI1N11sZnR5eC16TkpXVCJ9, eyJpc3M1013zdX'

// Supabase client তৈরি করুন
export const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Supabase configured successfully!')

// Supabase client তৈরি করুন
export const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Supabase configured successfully!')
