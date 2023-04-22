import {db, PostType} from '../db/db';

export const postsRepository = {
    findPosts() {
        return db.posts
    },

    findBlogById(id: string) {
        return db.posts.find(el => el.id === id)
    },

    createPost(title: string, shortDescription: string, content: string, blogId: string) {
        const newPost: PostType = {
            id: db.posts.length.toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName: 'Blog name'
        }

        db.posts.push(newPost)

        return newPost
    },

    updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string) {
        let postForUpdate = db.posts.find(el => el.id === id)

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

    deletePost(id: string) {
        const postToDelete = db.posts.find(el => el.id === id)

        if (postToDelete) {
            db.posts = db.posts.filter(f => f.id !== id)

            return true
        } else {
            return false
        }
    },
}
