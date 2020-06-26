const app = require('../src/app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../src/config');
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
before('clean the table', () => db.raw('TRUNCATE bookmarks, category RESTART IDENTITY CASCADE'));
afterEach('clean up', () => db.raw('TRUNCATE bookmarks, category RESTART IDENTITY CASCADE'));


const deleteTests = {
    emptyDB: () => {
        context('Given no bookmarks', () => {
            it('returns 404 and an error message', () => {
                const bookmarkId = 2;
                return supertest(app)
                    .delete(`/api/clipit/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message: `Bookmark with id ${bookmarkId} doesn't exist` } })
            })
        })
    },

    bookmarksInsideDB: () => {
        context('Given bookmarks in db', () => {
            const testCategory = makeCategoriesArray();
            const testBookmakrs = makeBookmarksArray();
            before('insert data', () => {
                return db
                    .insert(testCategory)
                    .into('category')
                    .then(() => {
                        return db
                            .insert(testBookmarks)
                            .into('bookmarks')
                    })
            })
            it('removes specified bookmark', () => {
                const bookmarkId = 2;
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
                return supertest(app)
                    .delete(`/api/clipit/bookmarks/${bookmarkId}`)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get('/api/clipit/bookmarks')
                            .expect(expectedBookmarks)
                    })

            })
        })
    }
}

module.exports = deleteTests;