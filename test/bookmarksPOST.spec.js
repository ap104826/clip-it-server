const app = require('../app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../config');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks-fixtures');

let db;

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: TEST_DATABASE_URL
    })
    app.set('db', db);
});


after('disconnect from db', () => db.destroy());
before('clean the table', () => db.raw('TRUNCATE bookmarks, categories RESTART IDENTITY CASCADE'));
afterEach('clean up', () => db.raw('TRUNCATE bookmarks, categories RESTART IDENTITY CASCADE'));

describe(`POST /api/bookmarks`, () => {

    it('creates new bookmark', () => {
        const newBookmark = {
            link: 'https://www.cnn.com/travel/article/summer-travel-safety-questions/index.html'
        }

        const createdBookmark = {
            id: 1,
            title: 'Summer vacation: What are the risks?',
            category_id: null,
            thumbnail_url: 'https://cdn.cnn.com/cnnnext/dam/assets/200604081945-zion-national-park-super-tease.jpg',
            link: 'https://www.cnn.com/travel/article/summer-travel-safety-questions/index.html',
            description: "In this new normal where everything is a calculation, summer vacation presents a whole host of questions. Here's some expert advice on some of the big questions around safe summer travel.",
            is_favorite: null,
            modified: `2020 - 06 - 27T23: 47: 25.883Z`
        }

        return supertest(app)
            .post('/api/bookmarks')
            .send(newBookmark)
            .expect(201)
            .expect(res => {
                expect(res.body.link).to.eql(newBookmark.link)
                expect(res.body.description).to.eql(createdBookmark.description)
                expect(res.body.title).to.eql(createdBookmark.title)
                expect(res.body.thumbnail_url).to.eql(createdBookmark.thumbnail_url)
                expect(res.body).to.have.property('id')
                expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
                const expected = new Date().toLocaleString()
                const actual = new Date(res.body.modified).toLocaleString()
                expect(actual).to.eql(expected)
            })
    })
})
