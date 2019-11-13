import express, { Router } from 'express';
import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { RifmDAO } from '../data/rifmDAO';
import { SpotifyDAO } from '../data/spotifyDAO';
import { User, UserDAO } from '../data/userDAO';

export function getRouter(spotify: SpotifyDAO, rifm: RifmDAO, users: UserDAO): Router {
    const router = express.Router();

    passport.use(new BearerStrategy(
        (token: string, done: Function) => {
            users.getUserFromToken(token)
            .then((user: User) => {
                if (!user) { return done(null, false); }
                return done(null, user);
            })
            .catch((err: any) => {
                return done(err);
            });
        }
    ));

    router.get('/spotify/search',
        passport.authenticate('bearer', { session: false }),
        (req, res) => {
            const searchTerm = req.query.q;
            spotify.searchAlbums(searchTerm)
            .then((results) => res.json(results))
            .catch((err) => res.status(500).send(err));
        }
    );
    router.get('/rifm/albums/:month',
        passport.authenticate('bearer', { session: false }),
        (req, res) => {
            const month = req.params.month;
            rifm.getAlbumsForMonth(month)
            .then((results) => res.json(results))
            .catch((err) => res.status(500).send(err));
        }
    );
    router.post('/rifm/albums',
        passport.authenticate('bearer', { session: false }),
        (req, res) => {
            const { month, user, album } = req.body;
            rifm.putAlbum(month, user, album)
            .then((results) => res.json(results))
            .catch((err) => res.status(500).send(err));
        }
    );

    return router;
}
