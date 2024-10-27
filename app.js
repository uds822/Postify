const express = require('express');
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require('cookie-parser'); // Corrected this line
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Added parentheses to correctly use the middleware
app.get('/', (req, res) => {
  res.render("index");
});


app.get('/profile',isLoggedIn, async (req, res) => {
  // console.log(req.user);
  let user= await userModel.findOne({email:req.user.email}).populate("posts");
  
  res.render("profile" ,{user});
});

app.get('/like/:id',isLoggedIn, async (req, res) => {
  // console.log(req.user);
  let post= await postModel.findOne({_id:req.params.id}).populate("user");
  if(post.likes.indexOf(req.user.userid)===-1){
    post.likes.push(req.user.userid);
  }
 else{
  post.likes.splice(post.likes.indexOf(req.user.userid), 1);
 }
  
  await post.save();
  res.redirect("/profile");
});
//Edit section
app.get('/edit/:id',isLoggedIn, async (req, res) => {
  // console.log(req.user);
 
  let post= await postModel.findOne({_id:req.params.id}).populate("user");
  res.render("edit", { post })
});
//Update post section
app.post('/update/:id',isLoggedIn, async (req, res) => {
  // console.log(req.user);
 
  let post= await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content})
  res.redirect("/profile")
});
//delet post
app.get('/delete/:id', async (req, res) => {
  let post= await postModel.findByIdAndDelete({_id:req.params.id})
  res.redirect("/profile")
});
app.post("/post",isLoggedIn, async (req, res) => {
  // console.log(req.user);
  let user= await userModel.findOne({email:req.user.email});
  let {content}=req.body;

  let post =await postModel.create({
    user : user._id,
    content
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});
//login
app.get('/login', (req, res) => {
  res.render("login");
});

app.post('/login', async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) {
    return res.status(500).send("Something went wrong");
  }

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token=jwt.sign({email:email,userid:user._id},"sshhhhhhhh");
      res.cookie("token",token);
      res.status(200).redirect("/profile");
    } else {
      res.render("login");
    }
  });
});
//Logout
app.get('/logout', async(req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

  function isLoggedIn(req, res,next) {
    if(req.cookies.token== "") res.redirect("/login");
    else{
      let data=jwt.verify(req.cookies.token ,"sshhhhhhhh");
      req.user=data;

    }
    next();
  }

//Register user
app.post('/register', async (req, res) => {
  let {email, password, username, name, age}=req.body;

  let user = await userModel.findOne({email});
  if(user) return res.status(500).send("User already registered");

  bcrypt.genSalt(10,(err,salt)=>{
     bcrypt.hash(password,salt, async(err,hash)=>{
      let user = await userModel.create({
        username,
        email,
        age,
        name,
        password:hash
      });
     let token=jwt.sign({email:email,userid:user._id},"sshhhhhhhh");
     res.cookie("token",token);
     res.redirect("/profile");
     })
})
});
// Middleware to prevent caching
app.use(function(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.listen(4000, () => {
  console.log("Server is running on port 4000"); // Optional: To check if the server is running properly
});