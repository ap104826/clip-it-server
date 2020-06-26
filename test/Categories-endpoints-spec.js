const app = require('../src/app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../src/config');
const { makeCategoriesArray } = require('./categories-fixtures');
const { makeBookmarksArray } = require('./bookmarks-fixtures');
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
afterEach('clean up', () => db.raw('TRUNCATE bookmarks, category RESTART IDENTITY CASCADE'));

describe('Category endpoints', () => {
    describe('GET/category', () => {
        context('given no categories in db', () => {
            it('returns empty array', () => {
                return supertest(app)
                    .get('/api/clipit/Category')
                    .expect(200, [])
            })
        })

        context('categories in db', () => {
            const testCategories = makeCategoriesArray();
            beforeEach('insert categories', () => {
                return db
                    .insert(testCategories)
                    .into('category')
            })

            it('returns all the categories', () => {
                return supertest(app)
                    .get('/api/clipit/category')
                    .expect(200, testCategories)
            })

        })
    })

    describe('POST/category', () => {
        it('returns 200 and posted category', () => {
            const newCategory = { name: 'new name' }
            return supertest(app)
                .post('/api/clipit/category')
                .send(newCategory)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newCategory.name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/clipit/category/${res.body.id}`)
                })
                .then(res => {
                    return supertest(app)
                        .get(`/api/clipit/category/${res.body.id}`)
                        .expect(res.body)
                })
        })
    })
    describe('GET/category/category_id', () => {
        context('given no categories in db', () => {
            it('returns an error', () => {
                const categoryID = 4;
                return supertest(app)
                    .get(`/api/clipit/category/${categoryID}`)
                    .expect(404, { error: { message: `Category with id ${categoryID} doesn't exist` } })
            })
        })
        context('given categories in db', () => {
            const testCategories = makeCategoriesArray();
            beforeEach('insert categories', () => {
                return db
                    .insert(testCategories)
                    .into('category')

            })
            it('returns specified category', () => {
                const categoryId = 1;
                return supertest(app)
                    .get(`/api/clipit/category${categoryId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(testCategories[categoryId - 1])
                    })
            })
        })
    })

    describe('DELETE/category/category_id', () => {
        context('given no categories in db', () => {
            it('returns error', () => {
                const categoryId = 2;
                return supertest(app)
                    .delete(`/api/clipit/category/${categoryId}`)
                    .expect(404, { error: { message: `Category with id ${categoryId} doesn't exist` } })
            })
        })
        context('given categories in db', () => {
            const testCategories = makeCategoriesArray();
            beforeEach('insert categories', () => {
                return db
                    .insert(testCategories)
                    .into('category')
            })
            it('deletes specified category', () => {
                const categoryId = 2;
                const expectedCategories = testCategories.filter(category => category.id !== categoryId)
                return supertest(app)
                    .delete(`/api/clipit/category/${categoryId}`)
                    .expect(204)
                    .then(() => {
                        return supertest(app)
                            .get('/api/clipit/category')
                            .expect(res => {
                                expect(res.body).to.eql(expectedCategories)
                            })
                    })
            })
        })
    })
    describe('PATCH/category/category_id', () => {
        context('given no categories in db', () => {
            it('returns an error', () => {
                const categoryId = 2;
                return supertest(app)
                    .patch(`/api/clipit/category/${categoryId}`)
                    .expect(404, { error: { message: `Category with id ${categoryId} doesn't exist` } })
            })
        })
        context('given full db', () => {
            const testCategories = makeCategoriesArray();
            beforeEach('inserts categories', () => {
                return db
                    .insert(testCategories)
                    .into('category')
            })
            it('updates selected category', () => {
                const idToUpdate = 2;
                const updatedCategory = { id: String(idToUpdate), name: 'updated name' }
                const expectedData = {
                    ...testCategories[idToUpdate - 1],
                    ...updatedCategory
                }
                return supertest(app)
                    .patch(`/api/clipit/category/${idToUpdate}`)
                    .send(updatedCategory)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(expectedData)
                    })
            })
            it('ignores unlisted fields', () => {
                const idToUpdate = 2;
                const updatedCategory = { id: String(idToUpdate), name: 'updated name' }
                const expectedData = {
                    ...testCategories[idToUpdate - 1],
                    ...updatedCategory
                }
                return supertest(app)
                    .patch(`/api/clipit/category/${idToUpdate}`)
                    .send({ ...updatedCategory, b: 'ignored property' })
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(expectedData)
                    })
            })
        })

    })
})