import AWS, { DynamoDB } from 'aws-sdk';

const TABLE_NAME = 'rifm';

export type AlbumPick = {
    month: string;
    user: string;
    album: AlbumInfo;
};

export type AlbumInfo = {
    title: string;
    artist: string;
};

export class RifmDAO {
    private dynamodb: DynamoDB;

    constructor() {
        this.dynamodb = new AWS.DynamoDB();
    }

    public getAlbumsForMonth(month: string): Promise<AlbumPick[]> {
        return new Promise((resolve, reject) => {
            const params = {
                ExpressionAttributeValues: {
                    ':v1': {
                        S: month,
                    },
                },
                ExpressionAttributeNames: {
                    '#month_key': 'month',
                },
                KeyConditionExpression: '#month_key = :v1',
                TableName: TABLE_NAME,
            };
            this.dynamodb.query(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                }
                resolve(data.Items.map((item) => {
                    return {
                        month: item.month.S,
                        user: item.user.S,
                        album: {
                            title: item.albumTitle.S,
                            artist: item.albumArtist.S,
                        },
                    };
                }));
            });
        });
    }

    public putAlbum(month: string, user: string, album: AlbumInfo) {
        return new Promise((resolve, reject) => {
            const params = {
                Item: {
                    month: { S: month },
                    user: { S: user },
                    albumTitle: { S: album.title },
                    albumArtist: { S: album.artist },
                },
                TableName: TABLE_NAME,
            };
            this.dynamodb.putItem(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}
