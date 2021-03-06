import { INSTANCE_NAME, ZOME_NAME } from '../config';

/**
 * Gets the post with the given id and returns it in an apollo client friendly shape 
 */
async function getPost(callZome, postId) {
  const post = await callZome(INSTANCE_NAME, ZOME_NAME, 'get_post')({
    post_address: postId
  });
  // Really important: prepare the object shape that ApolloClient expects
  return {
    id: postId,
    ...post
  };
}

export const resolvers = {
  Author: {
    id(parent) {
      return parent;
    },
    async posts(parent, args, { callZome }) {
      // Get the list of post addresses 
      const postAddresses = await callZome(
        INSTANCE_NAME,
        ZOME_NAME,
        'get_author_posts'
      )({ agent_id: parent });

      // Parallely iterate through the list of addresses to call `get_post` for each address
      const promises = postAddresses.map(async address => getPost(callZome, address));
      return Promise.all(promises);
    }
  },
  Post: {
    author(parent) {
      return parent.author_address;
    }
  },
  Query: {
    async allPosts(parent, args, context) {
      // Get the callZome function from the context
      const callZome = context.callZome;
      // Get all posts addresses
      const postAddresses = await callZome(
        INSTANCE_NAME,
        ZOME_NAME,
        'get_all_posts'
      )({});

      // Parallely iterate through the list of addresses to call `get_post` for each address
      const promises = postAddresses.map(async address => getPost(callZome, address));
      return Promise.all(promises);
    },
    async post(_, { id }, { callZome }) {
      return getPost(callZome, id)
    }
  },
  Mutation: {
    async createPost(_, { content }, { callZome }) {
      const postId = await callZome(
        INSTANCE_NAME,
        ZOME_NAME,
        'create_post'
      )({
        timestamp: getTimestamp(),
        content
      });

      return getPost(callZome, postId)
    },
  }
};

function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
