const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/list_helper')

blogsRouter.get('', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1, id: 1 })

    response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('', async (request, response) => {

    const body = request.body

    const user = request.user

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })

    if (!blog.hasOwnProperty('likes')) blog.likes = 0
    if (blog.title === undefined || blog.url === undefined) {
        response.status(400)
        response.end()
    } else {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.json(savedBlog.toJSON())
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    
    const user = request.user

    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === user.id.toString()) {
        Blog.findByIdAndRemove(request.params.id)
            .then(result => {
                response.status(204).end()
            })
    } else {
        response.status(400).end()
    }
})

blogsRouter.put('/:id', (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
        .then(updatedBlog => {
            response.json(updatedBlog)
        })
})

module.exports = blogsRouter