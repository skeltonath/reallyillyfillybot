import AWS, { DynamoDB } from 'aws-sdk';

const TABLE_NAME = 'users';

export type User = {
    id: string;
    name: string;
    accessToken: string;
    refreshToken: string;
};

export class UserDAO {
    private dynamodb: DynamoDB;

    constructor() {
        this.dynamodb = new AWS.DynamoDB();
    }

    public getUserById(id: string): Promise<User> {
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
                    name: data.Item.name.S,
                    accessToken: data.Item.accessToken.S,
                    refreshToken: data.Item.refreshToken.S
                });
            });
        });
    }
}
