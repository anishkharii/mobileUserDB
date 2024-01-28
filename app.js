const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI //|| 'mongodb://127.0.0.1:27017/loginDB';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type:String,
    required:true
},
  password: {
    type:String,
    required:true
  },
});

const User = mongoose.model('User', userSchema);

app.get('/api/users', async (req, res) => {
  if(req.query.passkey!=='AnishKhari'){
    return res.status(401).json({error:'Unauthorised'});
  }
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      message: 'User saved',
      username: newUser.username,
      email: newUser.email
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: 'Validation Error', details: err.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});



app.post('/api/users/find',async(req,res)=>{
  try{
    const user = await User.findOne(req.body.email);
    if(!user){
      return res.status(404).json({message:'User not Found.'});
    }
    return res.status(200).json({message:'User found'})
  }
  catch(err){
    res.status(500).json({error:'Internal Server Error'});
  }
})

app.post('/api/users/findAndVerify', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Wrong Password' });
    }

    res.status(200).json({ message: 'User found',user});
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/users/forgot-password',async(req,res)=>{
  try{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      res.status(404).json({error:'User not found'});
    }
    user.password = password;
    await user.save();
    return res.status(200).json({message:'User Password Updated Successfully'});
  }
  catch(error){
    res.status(500).json({error:'Internal Server Error'});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
