import pino from 'pino';
import SpotifyWebAPI from 'spotify-web-api-node';

export type SpotifyAlbumInfo = {
    id: string;
    name: string;
    image: string;
    url: string;
};

interface ILogger {
    error: (...args: any) => void;
    info: (...args: any) => void;
}

export class SpotifyDAO {
    private api: SpotifyWebAPI;

    constructor(clientId: string, clientSecret: string, private logger: ILogger = pino()) {
        this.api = new SpotifyWebAPI({
            clientId,
            clientSecret
        });

        this.fetchAccessToken();
    }

    private async fetchAccessToken() {
        this.api.clientCredentialsGrant().then(
            (data) => {
                this.logger.info('Spotify access token expires in ' + data.body.expires_in);
                this.logger.info('Spotify access token is ' + data.body.access_token);

                // Save the access token so that it"s used in future calls
                this.api.setAccessToken(data.body.access_token);

                // Recursively refetch after the duration of 'expires_in' - 1m buffer period
                setTimeout(() => {
                    this.fetchAccessToken();
                }, (data.body.expires_in - 60) * 1000);
            },
            (err) => {
                this.logger.error('Something went wrong when retrieving a spotify access token', err);
            }
        );
    }

    public searchAlbums(searchTerm: string): Promise<SpotifyAlbumInfo[]> {
        return new Promise((resolve, reject) => {
            this.api.searchAlbums(searchTerm, {limit: 5})
            .then((data) => {
                const albums = data.body.albums.items.map((item) => {
                    return {
                        id: item.id,
                        name: item.name,
                        // artist: item.artists[0].name,
                        image: item.images[2].url,
                        url: item.external_urls.spotify
                    };
                });
                resolve(albums);
            }, (err) => {
                this.logger.error(err);
                reject(err);
            });
        });
    }
}
