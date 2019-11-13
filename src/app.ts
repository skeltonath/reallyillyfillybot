import bodyParser from 'body-parser';
import express from 'express';
import passport from 'passport';
import { DiscordBot } from './bot/bot';
import { RifmDAO } from './data/rifmDAO';
import { SpotifyDAO } from './data/spotifyDAO';
import { UserDAO } from './data/userDAO';
import * as api from './routes/api';
import * as auth from './routes/auth';

const PORT = process.env.PORT || '3000';

// Set up data accessors
const spotify = new SpotifyDAO();
const rifm = new RifmDAO();
const users = new UserDAO();

// Initialize and start Discord bot
const discordBot = new DiscordBot(spotify);
discordBot.start();

// Initialize and start API server
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use('/auth', auth.getRouter(users));
app.use('/api', api.getRouter(spotify, rifm, users));
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
