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

describe(`PUT /api/bookmarks/:bookmark_id`, () => {
    context('Given no bookmarks', () => {
        it('returns error massage', () => {
            const idToUpdate = 2;
            return supertest(app)
                .patch(`/api/bookmarks/${idToUpdate}`)
                .expect(404, { error: { message: `bookmark doesn't exist` } })
        })
    })

    context('Given Bookmarks in db', () => {
        const testBookmarks = makeBookmarksArray();
        beforeEach('insert data', () => {
            return db
                .insert(testBookmarks)
                .into('bookmarks')
        })

        it('returns 200 and updates bookmark', () => {
            const bookmarkId = 1;
            const updatedFields = {
                id: String(bookmarkId),
                title: 'update test',
                is_favorite: false
            }
            const expectedBookmark = {
                ...testBookmarks[bookmarkId - 1],
                ...updatedFields
            }
            return supertest(app)
                .put(`/api/bookmarks/${bookmarkId}`)
                .send(updatedFields)
                .expect(204)
        })
    })


})
