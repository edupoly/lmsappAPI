var express = require('express')
var mongoose = require("mongoose")
var User = require("./models/user.model")
var bodyParser = require('body-parser')

var app = express()
app.use(express.static(__dirname+"/public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.get("/",(req,res)=>{
    res.send("server is running")
})

mongoose.connect("mongodb+srv://infoedupoly:edupoly83@cluster0.eitlw5l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));



// User Signup route
app.post('/usersignup', async (req, res) => {
    console.log(req.body)
    try {
      const { email, password, username, contact } = req.body;
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const newUser = new User({
        email,
        password,
        username,
        contact
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



app.listen(9999,()=>{
    console.log('server is running on 9999')
})