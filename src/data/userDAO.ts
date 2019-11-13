import AWS, { DynamoDB } from 'aws-sdk';
import fetch from 'node-fetch';

const TABLE_NAME = 'users';

export type DiscordUser = {
    id: string;
    username: string;
};

export type User = {
    id: string;
    username: string;
    accessToken: string;
    refreshToken: string;
};

export class UserDAO {
    private dynamodb: DynamoDB;

    constructor() {
        this.dynamodb = new AWS.DynamoDB();
    }

    public async saveUser(accessToken: string, refreshToken: string): Promise<any> {
        const user = await this.getDiscordUser(accessToken);
        return new Promise((resolve, reject) => {
            const params = {
                Item: {
                    id: { S: user.id },
                    username: { S: user.username },
                    accessToken: { S: accessToken },
                    refreshToken: { S: refreshToken }
                },
                TableName: TABLE_NAME
            };
            this.dynamodb.putItem(params, (err) => {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                }
                resolve();
            });
        });
    }

    public async getUserFromToken(token: string): Promise<User> {
        const user = await this.getDiscordUser(token);
        return await this.getUser(user.id);
    }

    public async getUser(id: string): Promise<User> {
        return new Promise((resolve, reject) => {
            const params = {
                Key: { id: { S: id } },
                TableName: TABLE_NAME
            };
            this.dynamodb.getItem(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                }
                resolve({
                    id: data.Item.id.S,
                    username: data.Item.username.S,
                    accessToken: data.Item.accessToken.S,
                    refreshToken: data.Item.refreshToken.S
                });
            });
        });
    }

    private async getDiscordUser(token: string): Promise<DiscordUser> {
        const response = await fetch('https://discordapp.com/api/users/@me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }
        });
        return await response.json();
    }
}
