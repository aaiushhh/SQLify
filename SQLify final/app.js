const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('./config/multiconfig')
const csv =require('csv-parser');
const fs= require('fs')
const FormData = require('form-data');
const fetch = require('node-fetch'); 

const userModel = require('./models/user-model');
const fileModel = require('./models/file-model');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/home', isLoggedIn, async(req, res) => {
    let id= req.user.userid;
    let user = await userModel.findById(id).populate('files');
    // console.log(user); 
    res.render('home', {user})
    // res.send('Welcome to home page');
});


app.get('/uploadFile', isLoggedIn, (req, res)=>{
    // console.log(req.user.userid);
    res.render('uploadFile')
})


app.get('/chat/:id', isLoggedIn, async(req, res)=>{
    let {id} = req.params;
    const fileData = await fileModel.findById(id);
    // res.send(fileData);
    const filePath = path.join('../CSVFiles', fileData.filename); // Path where file is stored
    // console.log(filePath);
    // Prepare form data for sending file to Flask server
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));  // Correctly attach file as a stream

    // Send file to Flask server
    const response = await fetch('http://localhost:5000/loadData', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': 'Bearer yourToken' // Add any necessary headers, avoid manually setting Content-Type
        }
    });
    // res.send(fileData)
    res.render('chat');
})


app.post('/query', isLoggedIn, async(req,res)=>{
    try {
        let { query } = req.body;
        let userQuery = { userQuery: query };

        console.log("User query:", query);

        // Send POST request to Flask server
        const response = await fetch('http://localhost:5000/getQuery', {
            method: 'POST',
            body: JSON.stringify(userQuery),
            headers: { 'Content-Type': 'application/json' }
        });

        // Parse response from Flask
        const result = await response.json();
        // console.log("Response from Flask:", result);

        // Send the result back to the user or render it on the webpage
        res.json(result);  // Or res.render('somepage', {result}); if you want to render a page

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Server error");
    }
})


// Uploading File 
app.post('/upload',isLoggedIn, upload.single('file'), async (req, res) => {
    try {
        let id= req.user.userid;
        let user = await userModel.findById(id);
        // Check if file exists
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Create a new file document with metadata
        const newFile = new fileModel({
            originalName: req.file.originalname,  // Original file name
            filename: req.file.filename,           // File name on the server
            filepath: req.file.path,               // Path where the file is stored
            size: req.file.size,                   // File size in bytes
            mimetype: req.file.mimetype            // File MIME type (should be 'text/csv')
        });
        user.files.push(newFile);
        await user.save();
    
        // Save metadata to MongoDB
        await newFile.save();

        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ email: email, userid: user._id }, 'secret');
            res.cookie('token', token);
            res.redirect('/home');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Registration route
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = await userModel.findOne({ email });
        if (user) return res.status(400).send('User already registered');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        user = new userModel({
            username,
            email,
            password: hash,
        });

        await user.save();

        const token = jwt.sign({ email: email, userid: user._id }, 'secret');
        res.cookie('token', token);
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('/');
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token) return res.status(401).send('You must be logged in');

    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send('Invalid or expired token');
    }
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
