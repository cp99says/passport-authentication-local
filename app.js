const express=require('express')
const app=express()
const mongoose=require('mongoose')
const ejs=require('ejs')

const routes=require('./routes')


app.set('view engine','ejs')


app.use('/',routes)




app.listen(3000,'127.0.0.1',()=>{console.log('server started at port 3000')})