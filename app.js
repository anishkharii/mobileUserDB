const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loginDB';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
    console.log(req.body);
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ userSaved: newUser.email });
  } catch (err) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

app.post('/api/users/find',async(req,res)=>{
  try{
    const { email }= req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({error:'User not Found.'});
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
