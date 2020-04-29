import { gql } from 'apollo-boost';

export const GET_ALL_POSTS = gql` 
  query GetAllPosts {
    allPosts {
      id
      content
      timestamp
      author {
        id
      }
    }
  }
`

export const CREATE_POSTS = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      timestamp
    }
  }
`;
