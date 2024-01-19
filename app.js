const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('connected to mongodb');
})

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});
const User = mongoose.model("User",userSchema);

app.get('/api/users',async(req,res)=>{
    try{
        const users = await User.find({});
        res.status(200).json(users);
    }
    catch(err){
        res.status(400).json({"Error":"Try again"});
    }
});

app.post('/api/users',async(req,res)=>{
    try{
        const newUser = new User({
            email:req.body.email,
            password:req.body.password
        });
        await newUser.save();
        res.status(200).json({"userSaved":newUser})

    }
    catch(err){
        res.status(400).json({"Error":"Try Again"});
    }
})

app.listen(process.env.PORT || 3001 , ()=>{
    console.log('running');
})