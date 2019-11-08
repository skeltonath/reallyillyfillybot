import env from 'dotenv';
import { APIServer } from './api/server';
import { DiscordBot } from './bot/bot';
import { RifmDAO } from './data/rifmDAO';
import { SpotifyDAO } from './data/spotifyDAO';

// configure env
env.config();
const {
    DISCORD_BOT_TOKEN,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    PORT,
} = process.env;

// Set up data accessors
const spotify = new SpotifyDAO(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
const rifm = new RifmDAO();

// Initialize and start API server
const apiServer = new APIServer(PORT, spotify, rifm);
apiServer.start();

// Initialize and start Discord bot
const discordBot = new DiscordBot(DISCORD_BOT_TOKEN, spotify, rifm);
discordBot.start();
