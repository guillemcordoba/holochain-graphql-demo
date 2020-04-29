import { gql } from 'apollo-boost';

export const GET_ALL_POSTS = gql` 
  query GetAllPosts {
    allPosts {
      id
    }
  }
`
export const GET_POST_DETAIL = gql` 
  query GetPostDetail(postId: ID!) {
    post(id: "${postId}") {
      id
      content
      timestamp
      author {
        id
      }
    }
  }
`

export const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      timestamp
    }
  }
`;
