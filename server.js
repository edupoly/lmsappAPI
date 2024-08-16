var express = require('express');
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

var User = require("./models/user.model");
var Admin = require("./models/admin.model");
var Cohort = require("./models/cohort.model");

var app = express();
app.use(express.static(__dirname + "/public"));
// Serve static files from the 'public' directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const JWT_SECRET = crypto.randomBytes(32).toString('hex');

// Enable CORS for all routes
app.use(cors());

app.get("/", (req, res) => {
  res.send("server is running");
});

mongoose.connect("mongodb+srv://infoedupoly:edupoly83@cluster0.eitlw5l.mongodb.net/EdupolyAPP?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;  // Attach the user information to the request object
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

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const cohortId = req.body.cohortid;
    const dir = path.join(__dirname, 'public', 'uploads', cohortId);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


// Admin route for creating a cohort with file upload
app.post('/createcohort', upload.single('cohortpic'), async (req, res) => {
  try {
    if (req.headers.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { cohortname, cohortid, cohorttags, createdAt } = req.body;
    const cohortpic = req.file ? req.file.originalname : null;

    // Create a new cohort document
    const newCohort = new Cohort({
      cohortname,
      cohortid,
      cohorttags,
      cohortpic,
      cohortdate: new Date(createdAt) // Convert string to Date object
    });

    await newCohort.save();
    console.log('Cohort created successfully:', newCohort);
    res.status(201).json({ message: 'Cohort created successfully', cohort: newCohort });
  } catch (err) {
    console.error("Error creating cohort:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to get all cohorts
app.get("/getcohorts", async (req, res) => {
  try {
    // Fetch cohorts from the database
    const cohorts = await Cohort.find();

    // Fetch the count of students enrolled in each cohort
    const cohortsWithCounts = await Promise.all(cohorts.map(async (cohort) => {
      const studentCount = await User.countDocuments({ cohorts: cohort.cohortid });

      // Generate the URL for cohortpic
      const cohortPicUrl = cohort.cohortpic ?
        `${req.protocol}://${req.get('host')}/uploads/${cohort.cohortid}/${cohort.cohortpic}` :
        null;

      return {
        ...cohort.toObject(),
        cohortpic: cohortPicUrl,
        studentCount: studentCount // Add the student count
      };
    }));

    res.json(cohortsWithCounts); // Return cohorts with the student count
  } catch (err) {
    console.error('Error fetching cohorts:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// getusersofacohort
app.get("/getusersofacohort", async (req, res) => {
  const { cohortId } = req.query;

  try {
    // Assuming your User model has a field like `cohortId` that stores the cohort ID
    const users = await User.find({ cohorts: cohortId });

    if (users.length > 0) {
      res.json(users);
    } else {
      res.status(404).json({ message: 'No users found for this cohort ID' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// adduserstocohort
app.post("/adduserstocohort", async (req, res) => {

  const { cohortId, contacts } = req.body;

  if (!cohortId || !Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  try {
    const result = await User.updateMany(
      { contact: { $in: contacts } }, // Match users by their contact
      { $addToSet: { cohorts: cohortId } } // Add cohortId to the cohorts array
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Users successfully added to cohort' });
    } else {
      res.status(404).json({ message: 'No users found with the provided contacts' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



app.listen(9999, () => {
  console.log('server is running on 9999');
});
