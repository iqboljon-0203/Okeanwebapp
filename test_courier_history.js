import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tpqaxranwoyxiquihtmh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcWF4cmFud295eGlxdWlodG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDUzMjEsImV4cCI6MjEwMTIyMTMyMX0.z38BBcWqx36eFk8TtprE2Nlk8_jIJ_v8fxJIdc76NaI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    console.log("Fetching from orders...");
    const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'delivered')
            .order('delivered_at', { ascending: false })
            .limit(1);
    
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
