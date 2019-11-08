import express from 'express';
import { RifmDAO } from '../data/rifmDAO';
import { SpotifyDAO } from '../data/spotifyDAO';

export class APIServer {

    constructor(private port: string = '3000', private spotify: SpotifyDAO, private rifm: RifmDAO) {}

    public start() {
        const app = express();
        app.use(express.json());

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
