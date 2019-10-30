const { stopSlsOffline, startSlsOffline, checkResp, checkErrorResp, GraphqlErrors, clearDynamondb} = require('../../common');
const {publicClient, authClient} = require('../../apollo-client');
const gql = require('graphql-tag');
const ErrorCodes = require('../../../config/errCodes');
const {assert} = require('chai');

describe('Todo', () => {
    beforeEach(async (done) => {
        const resp = await publicClient.mutate({
            mutation: gql`
                mutation {
                    register(name: "anxing", password: "anxing") {
                        id
                    }
                    login(name: "anxing", password: "anxing") {
                        id
                        name
                        token
                    }
                }
            `,
        });

        checkResp(resp);
        user = resp.data.login;

        done();
    });

    describe('createTodo', () => {
        it('work', async (done) => {
            const resp = await authClient.mutate({
                mutation: gql`
                    mutation {
                        createTodo(title: "todo-Title", content: "todo-Content") {
                            id
                            title
                            content
                            uid
                        }
                    }
                `,
                context: {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            });

            checkResp(resp);
            done();
        });
    });

    describe('getTodoList', () => {
        const createMultiTodos = async (count= 5) => {
            for (let i=0; i<5; i++) {
                await authClient.mutate({
                    mutation: gql`
                        mutation {
                            createTodo(title: "todo-Title-${i}", content: "todo-Content${i}") {
                                id
                                title
                                content
                                uid
                            }
                        }
                    `,
                    context: {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }
                });
            }
        }

        it('work', async (done) => {
            await createMultiTodos();
            const queryResp = await authClient.query({
                query : gql`
                    query {
                        getTodoList(query: {}, offset: 0, limit: 2) {
                            limit
                            offset
                            count
                            todos {
                                id
                                title
                                content
                            }
                        }
                    }
                `,
                context: {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            });

            checkResp(queryResp);
            let todos = queryResp.data.getTodoList;
            assert.deepStrictEqual(todos.count, 2);
            assert.deepStrictEqual(todos.limit, 2);
            assert.deepStrictEqual(todos.offset, 0);
            assert.deepStrictEqual(todos.todos.length, 2);

            done();
        });
    });
});
