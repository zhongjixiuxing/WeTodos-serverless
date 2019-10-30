const {UserInputError} = require('apollo-server-lambda');

const {dynamodb} = require('../../dynamodb');
const {tables} = require('../../../config/dynamodb');
const uuid = require('uuid/v4');
const {respJson, formatErr, encodeJwt} = require('../../utils');
const ErrorCodes = require('../../../config/errCodes');
const logger = require('../../logger');
const {login: wxLogin} = require('./wxUtil');
const appCfg = require('../../../config/appCfg');
const {GraphQLJSON, GraphQLJSONObject} = require('graphql-type-json');

const resolvers = {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,

    Query: {},
    Mutation: {
        register: async (_, { name, password }) => {
            const query = {
                TableName: 'User',
                Key: { name },
            };

            const result = await dynamodb.get(query).promise();
            if (result.Item) {
                throw new UserInputError(ErrorCodes.NAME_ALREADY_EXISTS);
            }

            const params = {
                TableName: tables.user.name,
                Item: {
                    id: uuid(),
                    name,
                    password
                }
            };

            await dynamodb.put(params).promise();
            return {
                id: params.Item.id,
                name: params.Item.name
            };
        },
        login: async (_, { name, password }) => {
            const query = {
                TableName: tables.user.name,
                Key: { name },
            };

            // get by key scheme (primary key)
            const result = await dynamodb.get(query).promise();
            if (!result.Item) {
                throw new UserInputError(ErrorCodes.USER_NAME_NOT_EXISTS);
            }

            if (result.Item.password !== password) {
                throw new UserInputError(ErrorCodes.PASSWORD_ERROR);
            }

            return {
                id: result.Item.id,
                name: result.Item.name,
                token: encodeJwt({id: result.Item.id}),
            }
        },
        wxLogin: async (_, { code }) => {
            const infos = await wxLogin(code);
            const openId = infos.openid;

            const query = {
                TableName: tables.user.name,
                IndexName: 'index_wxOpenId',
                KeyConditionExpression: "#wxOpenId = :id",
                ExpressionAttributeNames: {
                    "#wxOpenId": 'wxOpenId',
                },
                ExpressionAttributeValues: {
                    ":id": openId
                },
                Limit: 1,
            };

            const result = await dynamodb.query(query).promise();
            let user;
            if (result.Count === 0) {
                const params = {
                    TableName: tables.user.name,
                    Item: {
                        id: uuid(),
                        wxOpenId: openId,
                        profile: appCfg.defaultUserProfile
                    }
                };

                await dynamodb.put(params).promise();
                user = params.Item;
            } else {
                user = result.Items[0];
            }

            return {
                id: user.id,
                token: encodeJwt({id: user.id}),
                profile: user.profile,
                ...infos
            }
        }
    }
};

module.exports = {
    resolvers
}
