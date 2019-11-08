import Discord from 'discord.js';
import { RifmDAO } from '../data/rifmDAO';
import { SpotifyAlbumInfo, SpotifyDAO } from '../data/spotifyDAO';

const ARROW_RIGHT = '➡';
const ARROW_LEFT = '⬅';
const NUM_REACT_MAP = {
    1: ':one:',
    2: ':two:',
    3: ':three:',
    4: ':four:',
    5: ':five:',
};

export class DiscordBot {
    private discord: Discord.Client;
    private token: string;
    private spotify: SpotifyDAO;
    private rifm: RifmDAO;

    constructor(token: string, spotify: SpotifyDAO, rifm: RifmDAO) {
        this.token = token;
        this.spotify = spotify;
        this.rifm = rifm;
        this.discord = new Discord.Client();
    }

    public start() {
        this.discord.on('ready', () => {
            console.log(`Logged in as ${this.discord.user.tag}!`);
        });

        this.discord.on('message', (msg) => {
            const searchCommand = '!search';
            if (msg.content.startsWith(searchCommand)) {
                const searchTerm = msg.content.slice(searchCommand.length).trim();
                msg.channel.send('Searching for "' + searchTerm + '"')
                    .then((sent: Discord.Message) => {
                        this.spotify.searchAlbums(searchTerm).then((albums) => {
                            this.sendAlbumEmbed(sent, 0, albums);
                        });
                    })
                    .catch((err) => msg.reply('Error searching spotify: ' + err));
            }
        });

        this.discord.login(this.token);
    }

    private sendAlbumEmbed(message: Discord.Message, i: number, albumList: SpotifyAlbumInfo[]) {
        const filter = (reaction: Discord.MessageReaction, user: Discord.User) => user.id !== message.author.id &&
            [ARROW_LEFT, ARROW_RIGHT].includes(reaction.emoji.name);
        const album = albumList[i];
        const albumEmbed = new Discord.RichEmbed()
            .setColor('#1DB954')
            .setTitle(album.name)
            .setURL(album.url)
            // .setDescription(album.artist)
            .setThumbnail(album.image);
        message.edit(albumEmbed).then((sent: Discord.Message) => {
            sent.clearReactions()
                .then(() => sent.react(ARROW_LEFT))
                .then(() => sent.react(NUM_REACT_MAP[i + 1]))
                .then(() => sent.react(ARROW_RIGHT));
            const collector = sent.createReactionCollector(filter);
            collector.on('collect', (r)  => {
                if (r.emoji.name === ARROW_RIGHT) {
                    this.sendAlbumEmbed(sent, i + 1, albumList);
                }
                if (r.emoji.name === ARROW_LEFT) {
                    this.sendAlbumEmbed(sent, i - 1, albumList);
                }
            });
        });
    }
}
