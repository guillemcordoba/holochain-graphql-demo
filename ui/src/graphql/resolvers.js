import { INSTANCE_NAME, ZOME_NAME } from '../config';
import { parseResponse } from '../utils';

export const resolvers = {
  
  Query: {
    async allPost(_, __, { callZome }) {
      const result = await callZome(
        INSTANCE_NAME,
        ZOME_NAME,
        'get_all_posts'
      )({});

      return parseResponse(result);
    }
  },
  Mutation: {
    async createCourse(_, { title }, { callZome }) {
      const result = await callZome(
        INSTANCE_NAME,
        ZOME_NAME,
        'create_course'
      )({
        timestamp: getTimestamp(),
        title
      });

      return parseResponse(result);
    },
  }
};

function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}
