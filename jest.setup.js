const { config } = require('dotenv');
const { resolve } = require('path');

// 加載環境變量
config({
  path: resolve(__dirname, '.env.local')
});

// 打印環境變量以進行調試
console.log('Loaded environment variables:', {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
}); 