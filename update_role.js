import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tpqaxranwoyxiquihtmh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcWF4cmFud295eGlxdWlodG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDUzMjEsImV4cCI6MjEwMTIyMTMyMX0.z38BBcWqx36eFk8TtprE2Nlk8_jIJ_v8fxJIdc76NaI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateRole() {
  const adminIds = [1332582307, 8146600957, 224939174];
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .in('telegram_id', adminIds)
    .select();

  if (error) {
    console.error('Error updating role:', error.message);
  } else {
    console.log('Successfully updated role for admins:', data);
  }
}

updateRole();
