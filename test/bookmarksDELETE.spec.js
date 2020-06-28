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

describe(`DELETE /api/bookmarks/:bookmark_id`, () => {
    context('Given no bookmarks', () => {
        it('returns 404 and an error message', () => {
            const bookmarkId = 2;
            return supertest(app)
                .delete(`/api/bookmarks/${bookmarkId}`)
                .expect(404, { error: { message: `bookmark doesn't exist` } })
        })
    })

    context('Given bookmarks in db', () => {
        const testBookmarks = makeBookmarksArray();
        before('insert data', () => {
            return db
                .insert(testBookmarks)
                .into('bookmarks')
        })
        it('removes specified bookmark', () => {
            const bookmarkId = 2;
            const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
            return supertest(app)
                .delete(`/api/bookmarks/${bookmarkId}`)
                .expect(204)
                .then(res => {
                    return supertest(app)
                        .get('/api/bookmarks')
                        .expect(expectedBookmarks)
                })

        })
    })
})
