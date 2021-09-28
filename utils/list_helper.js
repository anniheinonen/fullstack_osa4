const _ = require("lodash");
const User = require('../models/user')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce(function (a, b) { return a + b.likes; }, 0);
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return {}

    const sorted = blogs.sort(function (a, b) {
        return a.likes - b.likes;
    });
    return sorted[sorted.length - 1]

}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return {}
    const counted = _.map(_.countBy(blogs, "author"), (val, key) => ({ author: key, blogs: val }))
    const sorted = counted.sort(function (a, b) {
        return a.blogs - b.blogs;
    });
    return sorted[sorted.length - 1]
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return {}

    let counted = blogs.reduce((acc, curr) => {
        let blog = acc.find(blog => blog.author === curr.author);

        if (blog) {
            blog.likes += curr.likes;
        } else {
            acc.push(curr);
        }

        return acc;
    }, []);
    const sorted = counted.sort(function (a, b) {
        return a.likes - b.likes;
    });

    return {
        "author": sorted[sorted.length - 1].author,
        "likes": sorted[sorted.length - 1].likes
    }
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
    usersInDb
}