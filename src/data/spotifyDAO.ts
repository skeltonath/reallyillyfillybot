import SpotifyWebAPI from 'spotify-web-api-node';

export type SpotifyAlbumInfo = {
    id: string;
    name: string;
    image: string;
    url: string;
};

export class SpotifyDAO {
    private api: SpotifyWebAPI;

    constructor(clientId: string, clientSecret: string) {
        this.api = new SpotifyWebAPI({
            clientId,
            clientSecret,
        });

        this.fetchAccessToken();
    }

    private async fetchAccessToken() {
        this.api.clientCredentialsGrant().then(
            (data) => {
                console.log('Spotify access token expires in ' + data.body.expires_in);
                console.log('Spotify access token is ' + data.body.access_token);

                // Save the access token so that it's used in future calls
                this.api.setAccessToken(data.body.access_token);

                // Recursively refetch after the duration of 'expires_in' - 1m buffer period
                setTimeout(() => {
                    this.fetchAccessToken();
                }, data.body.expires_in * 1000 - 60000);
            },
            (err) => {
                console.log('Something went wrong when retrieving a spotify access token', err);
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
                        url: item.external_urls.spotify,
                    };
                });
                resolve(albums);
            }, (err) => {
                console.error(err);
                reject(err);
            });
        });
    }
}
