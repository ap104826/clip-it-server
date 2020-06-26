const app = require('../src/app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../src/config');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks-fixtures');
const { makeCategoriesArray } = require('./category-fixtures');

let db;

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: TEST_DATABASE_URL
    })
    app.set('db', db);
});


after('disconnect from db', () => db.destroy());
before('clean the table', () => db.raw('TRUNCATE notes, category RESTART IDENTITY CASCADE'));
afterEach('clean up', () => db.raw('TRUNCATE notes, category RESTART IDENTITY CASCADE'));

const postTests = {
    insertBookmark: () => {
        const testCategory = makeCategoriesArray();
        beforeEach('insert category', () => {
            return db
                .into('category')
                .insert(testCategory)
        })

        it('creates new bookmark', () => {
            const newBookmark = {
                name: 'test bookmark',
                content: 'serrdfhgjkl',
                folder: 1
            }

            return supertest(app)
                .post('/api/clipit/bookmark')
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newBookmark.name)
                    expect(res.body.content).to.eql(newBookmark.content)
                    expect(res.body.Category).to.eql(newBookmark.Category)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/clipit/bookmarks/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_created).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/clipit/bookmarks/${res.body.id}`)
                        .expect(res.body)
                })
        })
    },
    missingField: () => {
        const requiredField = ['name', 'content', 'category']
        requiredField.forEach(field => {
            const newBookmark = {
                name: 'test bookmark',
                content: 'serrdfhgjkl',
                folder: 1
            }
            it('responds with error if field missing', () => {
                delete newBookmark[field]
                return supertest(app)
                    .post('/api/clipit/bookmarks/')
                    .send(newBookmark)
                    .expect(404, { error: { message: `Missing ${field}` } })
            })
        })
    },
    xssAttack: () => {
        it('removes xss attack content', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
            return supertest(app)
                .post('/api/clipit/Bookmarks')
                .send(maliciousBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(expectedBookmark.name)
                    expect(res.body.content).to.eql(expectedBookmark.content)
                })
        })
    }
}

module.exports = postTests;