import gql from 'graphql-tag';

export const typeDefs = gql`
  type Post {
    id: ID!
    content: String!
    timestamp: Int!
    author: Author!
  }

  type Author {
    id: ID!
    posts: [Post!]!
  }

  type Query {
    allPosts: [Post!]!
    post(id: ID!): Post!
  }

  type Mutation {
    createPost(content: String!): Post!
  }
`;

