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
before('clean the table', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));
afterEach('clean up', () => db.raw('TRUNCATE notes, folder RESTART IDENTITY CASCADE'));

const getTests = {
    emptyDB: () => {
        context('given no bookmarks', () => {
            it('returns status 200 and an empty array', () => {
                return supertest(app)
                    .get('/api/clipit/bookmarks')
                    .expect(200, [])
            })
        })
    },
    bookmarksInsideDB: () => {
        context('Given bookmarks in db', () => {
            const testBookmarks = makeBookmarksArray();
            const testCategory = makeCategoriesArray()

            beforeEach('insert articles', () => {
                return db
                    .into('category')
                    .insert(testCategory)
                    .then(() => {
                        return db
                            .into('bookmarks')
                            .insert(testBookmarks)
                    })
            })
            it('returns 200 and all the bookmarks', () => {
                return supertest(app)
                    .get('/api/clipit/bookmarks')
                    .expect(200, testBookmarks)
            })
        })
    },
    xssAttack: () => {
        context('given malicious attack', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
            const testCategory = makeCategoriesArray();
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
            it('removes xss attack content', () => {
                return supertest(app)
                    .get('/api/clipit/bookmarks')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedBookmark.name)
                        expect(res.body[0].content).to.eql(expectedBookmark.content)
                    })
            })
        })
    }
}

module.exports = getTests;