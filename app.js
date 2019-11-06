const express = require('express');
const Discord = require('discord.js');
const { searchTracks } = require('./src/api/spotify');

const ARROW_RIGHT = '➡';
const ARROW_LEFT = '⬅';
const NUM_REACT_MAP = {
    1: ':one:',
    2: ':two:',
    3: ':three:',
    4: ':four:',
    5: ':five:',
}

// Set up express API
const app = express();
const port = 3000;

// configure env
require('dotenv').config();
const { DISCORD_BOT_TOKEN } = process.env;

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/api/spotify/search', (req, res) => {
    const searchTerm = req.query.q;
    searchTracks(searchTerm)
        .then(results => res.json(results))
        .catch(err => res.status(500).send(err));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// Set up Discord Bot
const client = new Discord.Client();
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
        console.log(client.emojis.values());
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

client.on('message', msg => {
  const searchCommand = '!search';
  if (msg.content.startsWith(searchCommand)) {
    const searchTerm = msg.content.slice(searchCommand.length).trim();
    msg.channel.send('Searching for "' + searchTerm + '"')
        .then(sent => {
            searchTracks(searchTerm).then(albums => {
                sendAlbumEmbed(sent, 0, albums);
            });
        })
        .catch(err => msg.reply("Error searching spotify: " + err));
  }
});

client.login(DISCORD_BOT_TOKEN);