const SpotifyWebAPI = require('spotify-web-api-node');

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const spotify = new SpotifyWebAPI({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET
});

// Retrieve an access token.
spotify.clientCredentialsGrant().then(
    function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
  
      // Save the access token so that it's used in future calls
      spotify.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Something went wrong when retrieving an access token', err);
    }
  );

function searchTracks(searchTerm) {
    return new Promise((resolve, reject) => {
        console.log("search term:", searchTerm)
        spotify.searchAlbums(searchTerm, {limit: 5})
            .then(function(data) {
                console.log('Search by %s', searchTerm, data.body);
                const albums = data.body.albums.items.map(i => {
                    return {
                        id: i.id,
                        name: i.name,
                        artist: i.artists[0].name,
                        image: i.images[2].url,
                        url: i.external_urls.spotify
                    };
                })
                resolve(albums);
            }, function(err) {
                console.error(err);
                reject(err)
            });
    });
}

module.exports = { searchTracks };