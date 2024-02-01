require('dotenv').config({ debug: true });
const express = require('express')
require('./db/mongoose')
const cors = require('cors'); 
const userRouter = require('./routers/user')
const studyGroupRouter = require('./routers/studyGroup')
const notificationRouter = require('./routers/notification')

const app = express() 

app.use(cors()) 
app.use(function (req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
}); 

app.use(express.json()) 
app.use(userRouter)
app.use(studyGroupRouter) 
app.use(notificationRouter) 

const port = process.env.PORT || 3000 
app.listen(port, () => { 
    console.log('Server is up on port ' + port) 
})