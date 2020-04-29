import '@material/mwc-button';
import '@material/mwc-textarea';
import '@authentic/mwc-card';

import { getClient } from './graphql';
import { GET_ALL_POSTS, GET_POST_DETAIL, CREATE_POST } from './graphql/queries';

async function initApp() {
    setupPostList();
    setupCreatePost();
}

async function setupPostList() {
    const client = await getClient();
    client.watchQuery({
        query: GET_ALL_POSTS
    }).subscribe(newValue => updatePostList(newValue));

    const posts = result.data.allPosts;
    const postList = document.getElementById('post-list');

    const postsHTML = posts.map(post =>
        `<mwc-list-item id="${post.id}">${post.id}</mwc-list-item>`);

    postList.innerHTML = `<mwc-list>${postsHTML}</mwc-list>`;

    for (const post of posts) {
        document.getElementById(post).onclick = () =>
            setPostDetail(post)
    }
}

async function setupCreatePost() {
    const client = await getClient();

    const button = document.getElementById('create-post');
    const postContent = document.getElementById('post-content');
    button.onclick = () => {
        client.mutate({
            mutation: CREATE_POST,
            variables: {
                content: postContent.value
            },
            update: (cache, result) => {
                const { allPosts } = cache.readQuery({ query: GET_ALL_POSTS });
                cache.writeQuery({
                    query: GET_ALL_POSTS,
                    data: { allPosts: allPosts.concat([result.data.createPost]) },
                });
            }
        })
    }
}

async function setPostDetail(postId) {
    const postDetail = document.getElementById('post-detail');

    if (!postId) {
        postDetail.innerHTML = 'Click a post to see its contents';
        return;
    }

    const client = await getClient();

    const result = await client.query({
        query: GET_POST_DETAIL,
        variables: {
            postId
        }
    })
    const post = result.data;

    postDetail.innerHTML =
        `<mwc-card>
            <span>${post.content}</span>
            <span>Written by ${post.author.id} on ${post.timestamp.toLocaleString()}</span>
        </mwc-card>`
}

initApp();