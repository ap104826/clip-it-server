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


const patchTests = {
    emptyDB: () => {
        context('Given no bookmarks', () => {
            it('returns error massage', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/clipit/bookmarks/${idToUpdate}`)
                    .expect(404, { error: { message: `Bookmark with id ${idToUpdate} doesn't exist` } })
            })
        })
    },

    bookmarksInsideDB: () => {
        context('Given Bookmarks in db', () => {
            const testBookmarks = makeBookmarksArray();
            const testCategories = makeCategoriesArray();
            beforeEach('insert data', () => {
                return db
                    .insert(testCategories)
                    .into('category')
                    .then(() => {
                        return db
                            .insert(testBookmarks)
                            .into('bookmarks')
                    })
            })
            it('returns 200 and updates bookmark', () => {
                const bookmarkId = 1;
                const updatedFields = {
                    id: String(bookmarkId),
                    name: 'update test',
                    content: 'drfgjhkl',
                    date_created: testBookmarks[bookmarkId - 1].date_created,
                    category: 2
                }
                const expectedBookmark = {
                    ...testBookmarks[bookmarkId - 1],
                    ...updatedFields
                }
                return supertest(app)
                    .patch(`/api/clipit/bookmarks/${bookmarkId}`)
                    .send(updatedFields)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(expectedBookmark)
                    })
            })

        })
    },

}

module.exports = patchTests;