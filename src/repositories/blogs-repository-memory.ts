import {BlogType, __db} from '../db/__db';
import {BlogViewModel} from '../models/blogs/BlogViewModel';

export const blogsRepository = {
    async findBlogs(searchNameTerm: string | undefined): Promise<BlogViewModel[]> {
        let foundBlogs = __db.blogs

        if (searchNameTerm) {
            foundBlogs = foundBlogs.filter(el => el.name.toLowerCase().includes(searchNameTerm?.toString().toLowerCase()))
        }

        return foundBlogs
    },

    async findBlogById(id: string): Promise<BlogViewModel | undefined> {
        return __db.blogs.find(el => el.id === id)
    },

    async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogViewModel> {
        const newBlog: BlogType = {
            id: __db.blogs.length.toString(),
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        __db.blogs.push(newBlog)

        return newBlog
    },

    async updateBlog(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        let blogForUpdate = __db.blogs.find(el => el.id === id)

        if (blogForUpdate) {
            blogForUpdate.name = name
            blogForUpdate.description = description
            blogForUpdate.websiteUrl = websiteUrl

            return true
        } else {
            return false
        }
    },

    async deleteBlog(id: string): Promise<boolean> {
        const blogToDelete = __db.blogs.find(el => el.id === id)

        if (blogToDelete) {
            __db.blogs = __db.blogs.filter(f => f.id !== id)

            return true
        } else {
            return false
        }
    },
}
