// Configuração do Supabase
const SUPABASE_URL = 'https://hmhoholrueivqvmbbfql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtaG9ob2xydWVpdnF2bWJiZnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTUzODUsImV4cCI6MjA3Nzc3MTM4NX0.tMA0X8s5Ua3sZcpqbBg3q5xHFTmrTjbCFb_CwFCqCTc';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
