const app = require('../app');
const knex = require('knex');
const { TEST_DATABASE_URL } = require('../config');
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

describe('Category endpoints', () => {
    describe('GET /api/categories', () => {
        context('given no categories in db', () => {
            it('returns empty array', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, [])
            })
        })

        context('categories in db', () => {
            const testCategories = makeCategoriesArray();
            beforeEach('insert categories', () => {
                return db
                    .insert(testCategories)
                    .into('categories')
            })

            it('returns all the categories', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, testCategories)
            })

        })
    })

    describe('POST /api/categories', () => {
        it('returns 200 and posted category', () => {
            const newCategory = { name: 'new name' }
            return supertest(app)
                .post('/api/categories')
                .send(newCategory)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newCategory.name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/categories/${res.body.id}`)
                })
                .then(res => {
                    return supertest(app)
                        .get(`/api/categories/${res.body.id}`)
                        .expect(res.body)
                })
        })
    })
    describe('GET /api/categories/category_id', () => {
        context('given no categories in db', () => {
            it('returns an error', () => {
                const categoryID = 4;
                return supertest(app)
                    .get(`/api/categories/${categoryID}`)
                    .expect(404, { error: { message: `Category doesn't exist` } })
            })
        })
        context('given categories in db', () => {
            const testCategories = makeCategoriesArray();
            beforeEach('insert categories', () => {
                return db
                    .insert(testCategories)
                    .into('categories')

            })
            it('returns specified category', () => {
                const categoryId = 1;
                return supertest(app)
                    .get(`/api/categories/${categoryId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(testCategories[categoryId - 1])
                    })
            })
        })
    })

    describe('DELETE /api/categories/category_id', () => {
        context('given no categories in db', () => {
            it('returns error', () => {
                const categoryId = 2;
                return supertest(app)
                    .delete(`/api/categories/${categoryId}`)
                    .expect(404, { error: { message: `Category doesn't exist` } })
            })
        })
        context('given categories in db', () => {
            const testCategories = makeCategoriesArray();
            beforeEach('insert categories', () => {
                return db
                    .insert(testCategories)
                    .into('categories')
            })
            it('deletes specified category', () => {
                const categoryId = 2;
                const expectedCategories = testCategories.filter(category => category.id !== categoryId)
                return supertest(app)
                    .delete(`/api/categories/${categoryId}`)
                    .expect(204)
                    .then(() => {
                        return supertest(app)
                            .get('/api/categories')
                            .expect(res => {
                                expect(res.body).to.eql(expectedCategories)
                            })
                    })
            })
        })
    })

})