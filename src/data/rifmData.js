var AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB();

function getAlbumsForMonth(month) {
    return new Promise((resolve, reject) => {
        let params = {
            ExpressionAttributeValues: {
                ':v1': {
                    S: month
                }
            },
            ExpressionAttributeNames: {
                '#month_key': 'month'
            },
            KeyConditionExpression: '#month_key = :v1', 
            TableName: 'rifm'
        };
        dynamodb.query(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); 
                reject(err);
            }
            const albums = data.Items.map(item => {
                return {
                    'month': item.month.S,
                    'user': item.user.S,
                    'album': {
                        'title': item.albumTitle.S,
                        'artist': item.albumArtist.S
                    }
                };
            });
            resolve(albums);
        });
    });
}

function putAlbum(month, user, album) {
    return new Promise((resolve, reject) => {
        let params = {
            Item: {
                'month': { S: month },
                'user': { S: user },
                'albumTitle': { S: album.title },
                'albumArtist': { S: album.artist }
            },
            TableName: 'rifm'
        };
        dynamodb.putItem(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); 
                reject(err);
            }
            resolve(data);
        });
    });
}

module.exports = { getAlbumsForMonth, putAlbum };