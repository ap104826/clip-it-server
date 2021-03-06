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

describe(`GET /api/bookmarks`, () => {
    context('Given no bookmarks', () => {
        it('returns status 200 and an empty array', () => {
            return supertest(app)
                .get('/api/bookmarks')
                .expect(200, [])
        })
    })

    context('Given bookmarks in db', () => {
        const testBookmarks = makeBookmarksArray();

        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })
        it('returns 200 and all the bookmarks', () => {
            return supertest(app)
                .get('/api/bookmarks')
                .expect(200, testBookmarks)
        })
    })
})
