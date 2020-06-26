const app = require('../test/app')

describe('/api/', () => {
    it('GET / responds with 200 containing "Hello, world!"', () => {
        return supertest(app)
            .get('/api/')
            .expect(200, 'Hello, world!')
    })
})

