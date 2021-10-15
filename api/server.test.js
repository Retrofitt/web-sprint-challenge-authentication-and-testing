// Write your tests here
const server = require('../api/server')
const request = require('supertest')
const db = require('../data/dbConfig')

beforeAll(async ()=>{
  await db.migrate.rollback()
  await db.migrate.latest()
})
afterAll(async ()=>{
  await db.destroy()
})
describe('- server.js -', ()=>{
  //sanity-test
  test('sanity', () => {
  expect(false).toBe(false)
  })
  //auth-router
  describe('--- auth-router.js ---', ()=>{
    describe('[POST] Registers a new user', ()=>{
      it('responds with correct status 201', async()=>{
        const res = await request(server).post('/api/auth/register').send({username: 'TestUser123', password: 'abc123'})
        expect(res.status).toBe(201)
      })
      it('responds with correct username', async()=>{
        const res = await request(server).post('/api/auth/register').send({username: 'TestUser1234', password: 'abc123'})
        expect(res.body.username).toBe('TestUser1234')
      })
      it('responds with correct error if username is taken', async()=>{
        const res = await request(server).post('/api/auth/register').send({username: 'TestUser1234', password: 'abc123'})
        expect(res.status).toBe(409)
        expect(res.body.message).toMatch(/username taken/i)
      })
      it('responds with correct error if username is missing', async()=>{
        const res = await request(server).post('/api/auth/register').send({ password: 'abc123'})
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/username and password required/i)
      })
      it('returns id, username, & password', async()=>{
        const res = await request(server).post('/api/auth/register').send({username: 'TestUser12345', password: 'abc123'})
        expect(res.body).toHaveProperty('id')
        expect(res.body).toHaveProperty('username')
        expect(res.body).toHaveProperty('password')
      })
    })
    describe('[POST] Logs in an existing user', ()=>{
      it('responds with correct status 200', async()=>{
        const res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'})
        expect(res.status).toBe(200)
      })
      it('responds with correct error if username does not exist', async()=>{
        const res = await request(server).post('/api/auth/login').send({username: 'TestUser321', password: 'abc123'})
        expect(res.status).toBe(401)
        expect(res.body.message).toMatch(/invalid credentials/i)
      })
      it('responds with correct welcome message', async()=>{
        const res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'})
        expect(res.body.message).toMatch(/welcome, testUser123/i)
      })
      it('returns a token in the response', async()=>{
        const res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'})
        expect(res.body).toHaveProperty('token')
      })
    })
  })
  //jokes-router
  describe('--- jokes-router.js ---', ()=>{
    describe('[GET] a list of jokes; {Restricted} ', ()=>{
      it('responds with correct status 200', async()=>{
        let res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'}) 
        res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
        expect(res.status).toBe(200)
      })
      it('responds with correct error for missing token', async()=>{
        let res = await request(server).get('/api/jokes')
        expect(res.status).toBe(401)
        expect(res.body.message).toMatch(/token required/i)
      })
      it('responds with joke in first index', async()=>{
        let res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'}) 
        res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
        expect(res.body[0]).toStrictEqual({"id": "0189hNRf2g", "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."})
      })
      it('responds with joke in third index', async()=>{
        let res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'}) 
        res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
        expect(res.body[2]).toStrictEqual({"id": "08xHQCdx5Ed", "joke": "Why didn’t the skeleton cross the road? Because he had no guts."})
      })
      it('returns all jokes in database (3 jokes)', async()=>{
        let res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'}) 
        res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
        expect(res.body).toHaveLength(3)
      })
    })
  })
})
