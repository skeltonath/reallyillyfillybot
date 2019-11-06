// configure env
require('dotenv').config();
const {
    DISCORD_BOT_TOKEN,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    PORT
} = process.env;

const express = require('express');
const Discord = require('discord.js');
const Spotify = require('./src/api/spotify');
const RIFM = require('./src/data/rifmData');

const ARROW_RIGHT = '➡';
const ARROW_LEFT = '⬅';
const NUM_REACT_MAP = {
    1: ':one:',
    2: ':two:',
    3: ':three:',
    4: ':four:',
    5: ':five:',
}

// Set up Spotify API
Spotify.initializeClient(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);

// Set up express API
const app = express();
const port = PORT || 3000;
app.use(express.json())

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/api/spotify/search', (req, res) => {
    const searchTerm = req.query.q;
    Spotify.searchAlbums(searchTerm)
        .then(results => res.json(results))
        .catch(err => res.status(500).send(err));
});
app.get('/api/rifm/albums/:month', (req, res) => {
    const month = req.params.month;
    RIFM.getAlbumsForMonth(month)
        .then(results => res.json(results))
        .catch(err => res.status(500).send(err));
});
app.post('/api/rifm/albums', (req, res) => {
    const { month, user, album } = req.body;
    RIFM.putAlbum(month, user, album)
        .then(results => res.json(results))
        .catch(err => res.status(500).send(err));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// Set up Discord Bot
const discord = new Discord.Client();
discord.on('ready', () => {
  console.log(`Logged in as ${discord.user.tag}!`);
});

function sendAlbumEmbed(message, i, albumList) {
    const filter = (reaction, user) => user.id !== message.author.id &&
        [ARROW_LEFT, ARROW_RIGHT].includes(reaction.emoji.name);
    const album = albumList[i];
    let albumEmbed = new Discord.RichEmbed()
        .setColor('#1DB954')
        .setTitle(album.name)
        .setURL(album.url)
        .setDescription(album.artist)
        .setThumbnail(album.image);
    message.edit(albumEmbed).then(sent => {
        sent.clearReactions()
            .then(sent.react(ARROW_LEFT))
            .then(sent.react(NUM_REACT_MAP[i+1]))
            .then(sent.react(ARROW_RIGHT))
        const collector = sent.createReactionCollector(filter);
        collector.on('collect', r  => {
            if (r.emoji.name === ARROW_RIGHT) {
                updateAlbumEmbed(sent, i+1, albumList);
            }
            if (r.emoji.name === ARROW_LEFT) {
                updateAlbumEmbed(sent, i-1, albumList);
            }
        });
    });
}

discord.on('message', msg => {
  const searchCommand = '!search';
  if (msg.content.startsWith(searchCommand)) {
    const searchTerm = msg.content.slice(searchCommand.length).trim();
    msg.channel.send('Searching for "' + searchTerm + '"')
        .then(sent => {
            Spotify.searchAlbums(searchTerm).then(albums => {
                sendAlbumEmbed(sent, 0, albums);
            });
        })
        .catch(err => msg.reply("Error searching spotify: " + err));
  }
});

discord.login(DISCORD_BOT_TOKEN);