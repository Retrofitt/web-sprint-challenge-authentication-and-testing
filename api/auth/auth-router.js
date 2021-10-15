const router = require('express').Router();
const {validateRequest, uniqueUsername, validateUsername} = require('../users/users-middleware')
const Users = require('../users/users-model')
const {JWT_SECRET} = require('../secrets')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/register', validateRequest, uniqueUsername, (req, res, next) => {
  const {username, password} = req.body
  const hash = bcrypt.hashSync(password, 8)
  Users.add({username, password: hash})
    .then(newUser =>{
      res.status(201).json(newUser)
    })
    .catch(next)
});

router.post('/login', validateRequest, validateUsername,  (req, res, next) => {
  if(bcrypt.compareSync(req.body.password, req.user.password)){
    const token = tokenCreate(req.user)
    res.status(200).json({
      message: `Welcome, ${req.user.username}`,
      token
    })
  }else{
    next({status: 401, message: "invalid credentials"})
  }
  
  
  /*

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function tokenCreate(user){
  const payload = {
    subject: user.id,
    username: user.username
  }
  const options = {
    expiresIn: '1d'
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

module.exports = router;
