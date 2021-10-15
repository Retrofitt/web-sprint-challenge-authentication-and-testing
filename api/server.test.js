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
    })
    describe('[POST] Logs in an existing user', ()=>{
      it('responds with correct status 200', async()=>{
        const res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'})
        expect(res.status).toBe(200)
      })
      it('responds with correct welcome message', async()=>{
        const res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'})
        expect(res.body.message).toBe('Welcome, TestUser123')
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
      it('responds with joke if first index', async()=>{
        let res = await request(server).post('/api/auth/login').send({username: 'TestUser123', password: 'abc123'}) 
        res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
        expect(res.body[0]).toStrictEqual({"id": "0189hNRf2g", "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."})
      })
    })
  })
})
