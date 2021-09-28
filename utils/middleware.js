const jwt = require('jsonwebtoken')
const User = require('../models/user')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

const tokenExtractor = (request, response, next) => {
    request.token = getTokenFrom(request)
    next()
}

const userExtractor = async (request, response, next) => {
    try {
        decodedToken = jwt.verify(request.token, process.env.SECRET)
        request.user = await User.findById(decodedToken.id)
    } catch (err) {
        console.log(err)
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    next()
}

module.exports = {
    tokenExtractor,
    userExtractor
}