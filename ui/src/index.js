import '@material/mwc-button';
import '@material/mwc-textarea';
import '@authentic/mwc-card';

import { getClient } from './graphql';
import { GET_ALL_POSTS, CREATE_POST } from './graphql/queries';

async function initApp() {
    const client = await getClient();

    client.watchQuery({
        query: GET_ALL_POSTS
    }).subscribe(newValue => updatePostList(newValue));

    const button = document.getElementById('create-post');
    const postContent = document.getElementById('post-content');
    button.onclick = () => {
        client.mutate({
            mutation: CREATE_POST,
            variables: {
                content: postContent.value
            }
        })
    }
}

async function updatePostList(result) {
    const posts = result.data.allPosts;

    const postList = document.getElementById('post-list');

    const postsHTML = posts.map(post => `<mwc-card><span>${post.content}</span><span>Written on ${post.timestamp.toLocaleString()}</span></mwc-card>`);

    postList.innerHTML = postsHTML;
}


initApp();