import '@material/mwc-button';
import '@material/mwc-textarea';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@authentic/mwc-card';

import { getClient } from './graphql';
import { GET_ALL_POSTS, GET_POST_DETAIL, CREATE_POST } from './graphql/queries';

async function initApp() {
    const client = await getClient();

    setupPostList(client);
    setupCreatePost(client);
    setPostDetail(client, undefined);
}

async function setupPostList(client) {
    client.watchQuery({
        query: GET_ALL_POSTS
    }).subscribe(result => {
        const posts = result.data.allPosts;
        const postList = document.getElementById('post-list');

        const postsHTML = posts.map(post =>
            `<mwc-list-item id="${post.id}">${post.id}</mwc-list-item>`);

        postList.innerHTML = `<mwc-list>${postsHTML}</mwc-list>`;

        for (const post of posts) {
            document.getElementById(post.id).onclick = () =>
                setPostDetail(client, post.id)
        }
    });
}

async function setupCreatePost(client) {
    const button = document.getElementById('create-post');
    const postContent = document.getElementById('post-content');
    button.onclick = () => {
        client.mutate({
            mutation: CREATE_POST,
            variables: {
                content: postContent.value
            },
            update: (cache, result) => {
                const query = cache.readQuery({ query: GET_ALL_POSTS });
                cache.writeQuery({
                    query: GET_ALL_POSTS,
                    data: { allPosts: query.allPosts.concat([result.data.createPost]) },
                });
            }
        })
    }
}

async function setPostDetail(client, postId) {
    const postDetail = document.getElementById('post-detail');

    if (!postId) {
        postDetail.innerHTML = 'Click a post to see its contents';
        return;
    }

    const result = await client.query({
        query: GET_POST_DETAIL,
        variables: {
            postId
        }
    })
    const post = result.data.post;

    postDetail.innerHTML =
        `<mwc-card style="width: auto; ">
            <div style="padding: 16px;" class="column">
                <span style="margin-bottom: 10px;">${post.content}</span>
                <span style="opacity: 0.6">Written by ${post.author.id} <br> on ${new Date(post.timestamp).toUTCString()}</span>
            </div>
        </mwc-card>`
}

initApp();