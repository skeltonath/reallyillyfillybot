import express, { Router } from 'express';
import passport from 'passport';
import { OAuth2Strategy } from 'passport-oauth';
import { UserDAO } from '../data/userDAO';

const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET
} = process.env;

export function getRouter(users: UserDAO): Router {
    const router = express.Router();

    passport.use('discord', new OAuth2Strategy({
        authorizationURL: 'https://discordapp.com/api/oauth2/authorize',
        tokenURL: 'https://discordapp.com/api/oauth2/token',
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/discord/callback'
    }, (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        users.saveUser(accessToken, refreshToken);
        done(null, { accessToken });
    }));

    router.get('/discord', passport.authenticate('discord', { scope: ['identify'] }));
    router.get('/discord/callback', passport.authenticate('discord', { session: false }));

    return router;
}
