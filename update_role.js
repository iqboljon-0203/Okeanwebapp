import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wdulerytdoziygclcggf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdWxlcnl0ZG96aXlnY2xjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTU4NjcsImV4cCI6MjA4NTA5MTg2N30._U9XoaCEmC1nHNXTyz8lq-BR1qKhSLrZ_hGR1L1-OaU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateRole() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('telegram_id', 224939174)
    .select();

  if (error) {
    console.error('Error updating role:', error.message);
  } else {
    console.log('Successfully updated role:', data);
  }
}

updateRole();
