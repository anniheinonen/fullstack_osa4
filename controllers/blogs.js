const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('', (request, response) => {
    Blog
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
})

blogsRouter.post('', (request, response) => {
    const blog = new Blog(request.body)
    if (!blog.hasOwnProperty('likes')) blog.likes = 0
    if (!(blog.hasOwnProperty('title') && blog.hasOwnProperty('url'))) {
        response.status(400)
        response.end()
    } else {
        blog
            .save()
            .then(result => {
                response.status(201).json(result)
            })
    }
})

module.exports = blogsRouter