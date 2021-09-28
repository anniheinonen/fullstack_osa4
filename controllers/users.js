const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    const body = request.body

    if (!body.hasOwnProperty('password') || body.password.length < 4) {
        response.status(400).json({ error: 'Invalid password' }).end()
    } else if (!body.hasOwnProperty('username') || body.username.length < 4) {
        response.status(400).json({ error: 'Invalid username' }).end()
    } else {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)

        const user = new User({
            username: body.username,
            name: body.name,
            passwordHash,
        })

        const savedUser = await user.save().catch(error => {
            response.status(400).json({ error: error.message }).end()
        })

        response.json(savedUser)
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
    response.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter