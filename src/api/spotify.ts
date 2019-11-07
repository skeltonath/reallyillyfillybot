import SpotifyWebAPI from 'spotify-web-api-node';

export type SpotifyAlbumInfo = {
    id: string;
    name: string;
    image: string;
    url: string;
};

export class SpotifyAPI {

    private api: SpotifyWebAPI;

    constructor(clientId: string, clientSecret: string) {
        this.api = new SpotifyWebAPI({
            clientId,
            clientSecret,
        });

        // Retrieve an access token.
        this.api.clientCredentialsGrant().then(
            (data) => {
                console.log('The access token expires in ' + data.body.expires_in);
                console.log('The access token is ' + data.body.access_token);

                // Save the access token so that it's used in future calls
                this.api.setAccessToken(data.body.access_token);
            },
            (err) => {
                console.log('Something went wrong when retrieving an access token', err);
            },
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
