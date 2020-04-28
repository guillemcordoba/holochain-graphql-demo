import { makeExecutableSchema } from 'graphql-tools';
import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { SchemaLink } from 'apollo-link-schema';

import { resolvers } from './resolvers';
import { typeDefs } from './schema';
import { getConnection } from '../connection';

let client = undefined;

export async function getClient() {
  if (client) return client;

  const connection = await getConnection();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const link = new SchemaLink({ schema, context: { callZome: connection } });

  client = new ApolloClient({
    cache: new InMemoryCache(),
    connectToDevTools: true,
    link
  });
  return client;
}
