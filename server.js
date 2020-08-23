const express=require('express')
const app=express()
const bcrypt=require('bcrypt')
const passport=require('passport')
const flash=require('express-flash')
const session=require('express-session')
const dotenv=require('dotenv')
require('dotenv/config')


 const initializePassport=require('./passport-config')
 initializePassport(passport,
    email=> {return users.find(user=>user.email===email),
    id=>{return users.find(user=>user.id===id)}

})
 
const users=[];

app.set('view-engine','ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret:'this_is_my_secret',
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/',(req,res)=>{
    res.render('index.ejs',{name:req.user.name})
})

app.get('/login',(req,res)=>{
    res.render('login.ejs')  
})

app.get('/register', (req,res)=>{
    res.render('register.ejs')  
})

app.post('/login',passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))

app.post('/register', async(req,res)=>{
    try{
        const hashedpassword=await bcrypt.hash(req.body.password,12)
           users.push({
           id:Date.now().toString(),
           name:req.body.name,
           email:req.body.email,
           password:hashedpassword
       })
       
       res.redirect('/login')
      }catch(err){
         res.redirect('/register')
      }
      console.log(users)
})



app.listen('3000','127.0.0.1',()=>{console.log(`server started at port 3000`)})