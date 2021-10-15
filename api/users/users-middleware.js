const Users = require('./users-model')

const validateRequest = async(req, res, next)=>{
    const {username, password} = req.body
    if(!username || !password){
        next({status: 400, message: 'username and password required'})
    }else{
        next()
    }
}

const uniqueUsername = async(req, res, next)=>{
    try{
        const {username} = req.body
        const users = await Users.findBy({username: username})
        if(!users.length){
            next()
        }else{
            next({status: 409, message: 'username taken'})
        }
    }catch (err){
        next(err)
    }
}

const validateUsername = async(req, res, next)=>{
    try{
        const users = await Users.findBy({username: req.body.username})
        if(users.length){
            req.user = users[0]
            next()
        }else{
            next({status: 401, message: 'invalid credentials'})
        }
    }catch (err){
        next({err})
    }
}



module.exports = {
    validateRequest,
    uniqueUsername,
    validateUsername,
}
