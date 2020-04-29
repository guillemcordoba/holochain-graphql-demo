import { gql } from 'apollo-boost';
import { getClient } from './graphql';

async function initApp() {
    const client = await getClient();

    const result = await client.query({
        query: gql` {
            allPosts {
                id
                content
                timestamp
            }
        }`
    });

    console.log(result)
}


initApp();