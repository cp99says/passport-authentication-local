const express=require('express')
const app=express()
const mongoose=require('mongoose')
const ejs=require('ejs')
require('dotenv/config')

const routes=require('./routes')


app.set('view engine','ejs')


app.use('/',routes)



const port = process.env.PORT || 3000;
app.listen(port,'127.0.0.1',()=>{console.log(`server started at port ${port}`)})
