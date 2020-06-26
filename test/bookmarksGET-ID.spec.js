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


const getIdTests = {
    emptyDB: () => {
        context('given no bookmarks', () => {
            const idToFind = 2
            it('returns 404 and an error', () => {
                return supertest(app)
                    .get(`/api/clipit/bookmarks/${idToFind}`)
                    .expect(404, { error: { message: `Bookmark with id ${idToFind} doesn't exist` } })
            })
        })
    },

    bookmarksInsideDB: () => {
        context('given bookmarks', () => {
            const idToFind = 2
            const testCategory = makeCategoriesArray();
            const testBookmarks = makeBookmarksArray();

            beforeEach('insert bookmarks', () => {
                return db
                    .into('category')
                    .insert(testCategory)
                    .then(() => {
                        return db
                            .into('bookmarks')
                            .insert(testBookmarks)
                    })
            })
            it('returns 200 and selected bookmark', () => {
                return supertest(app)
                    .get(`/api/clipit/bookmarks/${idToFind}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(testBookmarks[idToFind - 1])
                    })
            })
        })
    },
    xssAttack: () => {
        context('given xss attack', () => {
            const testCategory = makeCategoriesArray();
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
            beforeEach('insert malicious bookmark', () => {
                return db
                    .into('category')
                    .insert(testCategory)
                    .then(() => {
                        return db
                            .into('bookmarks')
                            .insert(maliciousBookmark)
                    })
            })
            it('removes the attack', () => {
                return supertest(app)
                    .get(`/api/clipit/bookmarks/${maliciousBookmark.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedBookmark.name)
                        expect(res.body.content).to.eql(expectedBookmark.content)
                    })
            })
        })
    }
}

module.exports = getIdTests;