import dotenv from 'dotenv';
dotenv.config();

const steamApiKey = process.env.STEAM_API_KEY;
if (!steamApiKey || steamApiKey === 'STEAM_API_KEY_GOES_HERE') {
  console.warn('STEAM_API_KEY has not been set in your .env file, requests to Steam API will fail.');
}

const faceitApiKey = process.env.FACEIT_API_KEY;
if (!faceitApiKey || faceitApiKey === 'FACEIT_API_KEY_GOES_HERE') {
  console.warn('FACEIT_API_KEY has not been set in your .env file, requests to FACEIT API will fail.');
}
