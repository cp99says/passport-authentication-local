const express=require('express')
const app=express()
const mongoose=require('mongoose')
const bodyparser=require('body-parser')
const bcrypt=require('bcryptjs')
const user=require('./models')
var passport=require('passport')
const session=require('express-session')
const cokieParser=require('cookie-parser')
const cookieParser = require('cookie-parser')
const flash=require('connect-flash')

app.use(bodyparser.urlencoded({extended:true}))
mongoose.connect('mongodb://localhost:27017/users',{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false}).then(()=>{console.log(`db connected`)}).catch(err=>{console.log(err)})

app.use(cookieParser('my_super_secret'))
app.use(session({
     secret:'my_super-secret',
     maxAge: 3600000,
     resave:true,
     saveUninitialized:true    
}))


app.use(passport.initialize())
app.use(passport.session())
app.use(flash())    

app.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

const checkAthenticated=(req,res,next)=>{
      if(req.isAuthenticated())
      {
            res.set('Cache-Control','no-cache, private,no-store,must-revalidate,post-check=0,pre-check=0')
            return next()
      }else{
          res.redirect('/login')
      }
}


app.get('/',(req,res)=>{
    res.render('index')
})

app.post('/register',(req,res)=>{
    var {email, username, password, confirmpassword} = req.body
    if(!email || !username || !password || !confirmpassword)
    {
        var err= "Please fill all the details"
        res.render('index',{'err':err})
    }
    if(password != confirmpassword)
    {
        var err= "passwords dont match"
        res.render('index',{'err':err,'email':email,'username':username})
    }
    if(typeof err == 'undefined')
    {
       user.findOne({email:email},(err,data)=>{
           if(err) throw err
           if(data){
            console.log(data+"   \n")
            console.log('user exists')
            err="user already exists with this email"
            res.render('index',{'err':err,'email':email,'username':username})
           }
           else{
               bcrypt.genSalt(10,(err,salt)=>{
                   if(err) throw err
                   bcrypt.hash(password,salt,(err,hash)=>{
                       if(err) throw err
                       password=hash
                       user({
                           email,username,password
                       }).save((err,data)=>{
                          if(err) throw err


                           req.flash('success_message',"Registered Successfully, Login to continue")


                           console.log(data)
                           res.redirect('/login')
                       })
                   })
               })
           }      

       })
    }
})

//login implementation

app.get('/login',(req,res)=>{
    res.render('login')
})

var localStrategy=require('passport-local').Strategy
passport.use(new localStrategy({usernameField:'email'},(email,password,done)=>{
    user.findOne({email:email},(err,data)=>{
        if(err) throw err
        if(!data)
        {
            return done(null,false)
        }
        bcrypt.compare(password,data.password,(err,match)=>{
            if(err) 
                    return (done(null,false,{message:'user does not exist'}))
            
                if(!match)
                    return (done(null,false,{message:'passwords dont match'}))

            if(match){
                return done(null,data)
            }
        })
    })
}))

passport.serializeUser((user,cb)=>{
    cb(null,user.id)
})
passport.deserializeUser((id,cb)=>{
    user.findById(id,(err,user)=>{
            cb(err,user)
    })
})

app.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/success',    
        successMessage:true,
        failureMessage:true,
        failureFlash:true,
        successFlash:true
        
    })(req,res,next)
})


app.get('/success',checkAthenticated,(req,res)=>{
    res.render('success',{'user':req.user})
})

app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
})

app.post('/addmsg',checkAthenticated,(req,res)=>{
    user.findOneAndUpdate(
         {email:req.user.email},
        { $push:{
            messages:req.body['msg']
        } },(err,suc)=>{ 
            if(err) {console.log(err)}

            if(suc){
                console.log(suc+"    \n")
                console.log('data added')
                
            }
         }
    )
    res.redirect('/success')
})

module.exports=app