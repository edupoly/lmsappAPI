var express = require('express');
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

var User = require("./models/user.model");
var Admin = require("./models/admin.model");
var Course = require("./models/course.model");

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const JWT_SECRET = crypto.randomBytes(32).toString('hex');

// Enable CORS for all routes
app.use(cors());

app.get("/", (req, res) => {
    res.send("server is running");
});

mongoose.connect("mongodb+srv://infoedupoly:edupoly83@cluster0.eitlw5l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };





// User Signup route
app.post('/usersignup', async (req, res) => {
    console.log('Received signup request:', req.body); // Log the request body
    try {
        const { email, password, username, contact } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User with email already exists:', email); // Log if user already exists
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            email,
            password,
            username,
            contact
        });

        await newUser.save();
        console.log('User created successfully:', newUser); // Log the created user details
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error("Error creating user:", err); // Log any errors that occur
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Admin Signup route
app.post('/adminsignup', async (req, res) => {
    try {
      // console.log(req.body)
      const { email, password, username, contact } = req.body;
      const existingAdmin = await Admin.findOne({ email });
  
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
  
      const newAdmin = new Admin({
        adminemail: email,
        adminpassword: password,
        adminusername: username,
        admincontact: contact
      });
  
      await newAdmin.save();
      console.log('Admin created successfully:', newAdmin); // Log the created user details
      res.status(201).json({ message: 'Admin created successfully' });
    } catch (err) {
      console.error("Error creating admin:", err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// Admin and User Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check the Admin collection first
        let user = await Admin.findOne({ adminusername: username, adminpassword: password });
        if (user) {
            const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
            console.log(`Admin login: ${username}`); // Log admin login
            return res.json({ username, token, role: 'admin' });
        }

        // If not found in Admin, check the User collection
        user = await User.findOne({ username, password });
        if (user) {
            const token = jwt.sign({ username, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
            console.log(`User login: ${username}`); // Log user login
            return res.json({ username, token, role: 'user' });
        }

        // If no user found
        console.log(`Failed login attempt: ${username}`); // Log failed login attempt
        res.status(401).json({ message: 'Invalid credentials' });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Admin routes
app.post('/createcourse', async (req, res) => {
  try {
      // Check if the user has an admin role
      if (req.headers.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      // Extract the required fields from the request body
      const {
          coursetopic,
          coursename,
          coursetrainer,
          courseduration,
          courseprice,
          courseprereq,
          coursesamplevideo,
          coursetype,
          courselogourl,
          coursedescription,
          courseroughtopics,
          coursevideos
      } = req.body;

      // Create a new course document
      const newCourse = new Course({
          coursetopic,          // Included coursetopic
          coursename,
          coursetrainer,
          courseduration,
          courseprice,
          courseprereq,
          coursesamplevideo,
          coursetype,
          courselogourl,
          coursedescription,
          courseroughtopics,
          coursevideos
      });

      // Save the course to the database
      await newCourse.save();
      
      // Log the created course details
      console.log('Course created successfully:', newCourse);
      
      // Respond with success message and course data
      res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (err) {
      // Log any errors that occur
      console.error("Error creating course:", err);
      
      // Respond with an internal server error status
      res.status(500).json({ message: 'Internal server error' });
  }
});






app.listen(9999, () => {
    console.log('server is running on 9999');
});
