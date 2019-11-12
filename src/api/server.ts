import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { OAuth2Strategy } from 'passport-oauth';
import { RifmDAO } from '../data/rifmDAO';
import { SpotifyDAO } from '../data/spotifyDAO';
import { User, UserDAO } from '../data/userDAO';

export class APIServer {

    constructor(
        private port: string = '3000',
        private spotify: SpotifyDAO,
        private rifm: RifmDAO,
        private users: UserDAO,
    ) {}

    public start() {
        passport.use('discord', new OAuth2Strategy({
            authorizationURL: 'https://discordapp.com/api/oauth2/authorize',
            tokenURL: 'https://discordapp.com/api/oauth2/token',
            clientID: '400029708915441666',
            clientSecret: 'h0I_7SDVARBQn_v1Zf14cJNVsM1yhGMm',
            callbackURL: 'http://localhost:3000/auth/discord/callback',
        }, (accessToken, refreshToken, profile, done) => {
            console.log('accessToken:', accessToken);
            console.log('refreshToken:', refreshToken);
            console.log('profile:', profile);
            done(null, {
                id: '1',
                accessToken,
                refreshToken,
            });
        }));

        passport.serializeUser((user: User, done) => {
            done(null, user.id);
        });

        passport.deserializeUser((id: string, done) => {
            this.users.getUserById(id)
                .then((user) => done(null, user))
                .catch((err) => done(err));
        });

        const app = express();
        app.use(express.json());
        app.use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: true,
        }));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(passport.initialize());
        app.use(passport.session());

        app.get('/auth/discord', passport.authenticate('discord', { scope: ['identify'] }));
        app.get('/auth/discord/callback',
            passport.authenticate('discord', { successRedirect: '/', failureRedirect: '/login' }));

        app.get('/', (req, res) => res.send('Hello World!'));
        app.get('/api/spotify/search', (req, res) => {
            const searchTerm = req.query.q;
            this.spotify.searchAlbums(searchTerm)
            .then((results) => res.json(results))
            .catch((err) => res.status(500).send(err));
        });
        app.get('/api/rifm/albums/:month', (req, res) => {
            const month = req.params.month;
            this.rifm.getAlbumsForMonth(month)
            .then((results) => res.json(results))
            .catch((err) => res.status(500).send(err));
        });
        app.post('/api/rifm/albums', (req, res) => {
            const { month, user, album } = req.body;
            this.rifm.putAlbum(month, user, album)
            .then((results) => res.json(results))
            .catch((err) => res.status(500).send(err));
        });

        app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
    }
}
