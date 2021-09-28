const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('../utils/list_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    },
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there is a field named id', async () => {
    const blogs = await api.get('/api/blogs')
    blogs.body.forEach(blog => {
        expect(blog.id).toBeDefined();
    });
});

describe('adding blogs', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'Added blog in a test',
            author: 'Tester function',
            url: 'testulr',
            likes: 2
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')

        const titles = response.body.map(r => r.title)

        expect(response.body).toHaveLength(initialBlogs.length + 1)
        expect(titles).toContain(
            'Added blog in a test'
        )
    })

    test('If a blog with no likes-field is added, likes equals to 0', async () => {
        const blogWithoutLikes = {
            title: 'Blog with no likes',
            author: 'Tester function',
            url: 'testulr'
        }

        await api
            .post('/api/blogs')
            .send(blogWithoutLikes)

        const response = await api.get('/api/blogs')

        const addedBlog = response.body.find(blog => blog.title === 'Blog with no likes')

        expect(addedBlog.likes).toEqual(0)
    })
})

test('Adding a blog with no title or url field should result in 400', async () => {
    const blogWithoutTitle = {
        author: 'Tester function',
        url: 'testiurl',
        likes: 3
    }
    const blogWithoutUrl = {
        title: 'no url blog',
        author: 'Tester function',
        likes: 3
    }

    await api
        .post('/api/blogs')
        .send(blogWithoutTitle)
        .expect(400)

})


describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('get all users should return JSON', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'anni',
            name: 'Anni',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

describe('Trying to create users with invalid fields', () => {
    test('creation without password does not work', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'anniwithoutpassword',
            name: 'Anni',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(result.body.error).toContain('Invalid password')
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation with too short password does not work', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'anniwithoutpassword',
            name: 'Anni',
            password: 'ee'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(result.body.error).toContain('Invalid password')
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation without username does not work', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'Anni',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(result.body.error).toContain('Invalid username')
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})


afterAll(() => {
    mongoose.connection.close()
})