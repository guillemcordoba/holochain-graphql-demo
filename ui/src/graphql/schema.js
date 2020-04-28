import gql from 'graphql-tag';

export const typeDefs = gql`
  type Post {
    id: ID!
    content: String!
    author: Author!
  }

  type Author {
    id: ID!
    posts: [Post!]!
  }

  type Query {
    allPosts: [Post!]!
  }

  type Mutation {
    createPost(content: String!): ID!
  }
`;

