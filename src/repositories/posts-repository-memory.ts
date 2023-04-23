import {__db, PostType} from '../db/__db';
import {PostViewModel} from '../models/posts/PostViewModel';

export const postsRepository = {
    async findPosts(): Promise<PostViewModel[]> {
        return __db.posts
    },

    async findBlogById(id: string): Promise<PostViewModel | undefined> {
        return __db.posts.find(el => el.id === id)
    },

    async createPost(title: string, shortDescription: string, content: string, blogId: string): Promise<PostViewModel> {
        const newPost: PostType = {
            id: __db.posts.length.toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName: 'Blog name',
            createdAt: new Date().toISOString(),
        }

        __db.posts.push(newPost)

        return newPost
    },

    async updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        let postForUpdate = __db.posts.find(el => el.id === id)

        if (postForUpdate) {
            postForUpdate.title = title
            postForUpdate.shortDescription = shortDescription
            postForUpdate.content = content
            postForUpdate.blogId = blogId

            return true
        } else {
            return false
        }
    },

    async deletePost(id: string): Promise<boolean> {
        const postToDelete = __db.posts.find(el => el.id === id)

        if (postToDelete) {
            __db.posts = __db.posts.filter(f => f.id !== id)

            return true
        } else {
            return false
        }
    },
}
