# reallyillyfillybot
Discord bot and API for Really Illy Filly Music group.

## Prerequisites
* [nodejs 12.13.0 LTS](https://nodejs.org/en/)
* [yarn](https://yarnpkg.com/lang/en/)

I recommend using [nvm](https://github.com/nvm-sh/nvm) to manage nodejs versions, but it's not necessary.

## Getting started
Once you have the project cloned, install the dependencies:

```
yarn install
```

Next you'll need to obtain credentials for the services used in the project and save them in the `.env` file.

### Spotify
1. Create a developer account [here](https://developer.spotify.com/dashboard).
2. Create a new application.
3. Copy the Client ID and Client Secret into your `.env` file.

### Discord
1. Create a developer account [here](https://discordapp.com/developers/applications/).
2. Create a new application.
3. Copy the Client ID and Client Secret into your `.env` file.
4. In the sidebar, go to the "Bot" tab.
5. Add a "Bot User" to your application.
6. Copy the Token into your `.env` file.
7. Follow this [small guide](https://discordapp.com/developers/docs/topics/oauth2#bot-authorization-flow) to add your bot to the Discord server of your choice.

### AWS
1. Create an AWS account.
2. Create an IAM user.
3. Give it permissions to read and write to DynamoDB.
4. Copy the Access Key ID and the Secret Access Key into your `.env` file.
5. Create a DynamoDB table called "rifm" with a partition key of "month" and a sort key of "user".

In the future, I plan on making a shared AWS account for development. Until then, you'll have to use a personal one for testing your changes.

## Running locally
To run the server locally, simply run:

```
yarn local
```

## Deploying to production
This project is hosted at Heroku [here](https://dashboard.heroku.com/apps/reallyillyfillybot).
If you would like permission to manage or deploy this application, let me know in Discord.