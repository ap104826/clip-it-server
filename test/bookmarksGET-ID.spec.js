const app = require('../app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../config');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks-fixtures');
const { makeCategoriesArray } = require('./categories-fixtures');

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

describe(`GET /api/bookmarks/:bookmark_id`, () => {
    context('given no bookmarks', () => {
        const idToFind = 2
        it('returns 404 and an error', () => {
            return supertest(app)
                .get(`/api/bookmarks/${idToFind}`)
                .expect(404, { error: { message: `bookmark doesn't exist` } })
        })
    })

    context('given bookmarks', () => {
        const idToFind = 2
        const testBookmarks = makeBookmarksArray();

        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })
        it('returns 200 and selected bookmark', () => {
            return supertest(app)
                .get(`/api/bookmarks/${idToFind}`)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.eql(testBookmarks[idToFind - 1])
                })
        })
    })
})
