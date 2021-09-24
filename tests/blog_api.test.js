const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
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


afterAll(() => {
    mongoose.connection.close()
})