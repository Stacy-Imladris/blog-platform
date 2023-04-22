import {BlogType, db} from '../db/db';

export const blogsRepository = {
    findBlogs(searchNameTerm: string | undefined) {
        let foundBlogs = db.blogs

        if (searchNameTerm) {
            foundBlogs = foundBlogs.filter(el => el.name.toLowerCase().includes(searchNameTerm?.toString().toLowerCase()))
        }

        return foundBlogs
    },

    findBlogById(id: string) {
        return db.blogs.find(el => el.id === id)
    },

    createBlog(name: string, description: string, websiteUrl: string) {
        const newBlog: BlogType = {
            id: db.blogs.length.toString(),
            name,
            description,
            websiteUrl
        }

        db.blogs.push(newBlog)

        return newBlog
    },

    updateBlog(id: string, name: string, description: string, websiteUrl: string) {
        let blogForUpdate = db.blogs.find(el => el.id === id)

        if (blogForUpdate) {
            blogForUpdate.name = name
            blogForUpdate.description = description
            blogForUpdate.websiteUrl = websiteUrl

            return true
        } else {
            return false
        }
    },

    deleteBlog(id: string) {
        const blogToDelete = db.blogs.find(el => el.id === id)

        if (blogToDelete) {
            db.blogs = db.blogs.filter(f => f.id !== id)

            return true
        } else {
            return false
        }
    },
}
