import { makeExecutableSchema } from 'graphql-tools';
import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { SchemaLink } from 'apollo-link-schema';

import { resolvers } from './resolvers';
import { typeDefs } from './schema';
import { getConnection } from '../connection';

export async function createSchemaLink() {
  // Get the callZome connection
  const connection = await getConnection();

  // Create an executable schema from the schema and resolvers
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Return a final link with our executable schema and the callZome inside the context
  return new SchemaLink({ schema, context: { callZome: connection } });
}

let client = undefined;

export async function getClient() {
  if (client) return client;

  // Create our schema link
  const link = await createSchemaLink();

  // Initialize the apollo client
  client = new ApolloClient({
    cache: new InMemoryCache(),
    connectToDevTools: true,
    link
  });
  return client;
}
