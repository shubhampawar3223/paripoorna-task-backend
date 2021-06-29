const express = require('express');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const cors = require('cors');
const Joi= require('joi');
require('dotenv').config();
const app = express();
const port = process.env.PORT ||6010;
const db_url = process.env.DB_URL || 'mongodb://127.0.0.1:27017';
let id=0;

app.use(express.json());
app.use(cors());

//below API is used to get current Id of user.
app.get('/api/currentId',(req,res)=>{
    res.status(200).json({cId:id})
})

//below API is used to add new member to db.
app.post('/api/addMember',validateNewMember,async(req,res)=>{
    try{
    const clientInfo = await mongoClient.connect(db_url);
    const db = clientInfo.db("app");
    req.body.userId = ++id;  
    await db.collection("members").insertOne(req.body);
    res.status(200).json({message:"User added"});
    clientInfo.close();
    }
    catch(e){
       console.log(e);
    }
})

//validateNewMember() is a validation middleware.
function validateNewMember(req,res,next){
  const schema = Joi.object().keys({
      fullName:Joi.string().min(3).required(),
      picUrl:Joi.string().uri(),
      countryCode:Joi.string().min(3).max(3).required(),
      mobileNo:Joi.string().min(10).max(10).required(),
      email:Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
      jobType:Joi.string().required(),
      dob:Joi.string().required(),
      location:Joi.string().min(3).required(),  
  })         
     const result = schema.validate(req.body);
     if(!result.error){
         next()
     }   
     else{
         
        res.status(400).json({error:result.error.details[0].message}); 
     }  

}

//below API is used to show user all entries of members.
app.get('/api/showList',async(req,res)=>{
    try{
    const clientInfo = await mongoClient.connect(db_url);
    const db = clientInfo.db("app");
    let data = await db.collection("members").find().toArray();
    res.status(200).json({result:data});
    clientInfo.close();
    }
    catch(e){
        console.log(e); 
    }
})

//below API is used to update the user member.
app.put("/api/update/:id",validateNewMember,async(req,res)=>{
    try{
    const clientInfo = await mongoClient.connect(db_url);
    const db = clientInfo.db("app");
    let item = await db.collection("members").find({userId:+req.params.id}).project({userId:1}).toArray(); 
    if(item.length){
    await db.collection("members").findOneAndUpdate({userId:+req.params.id},{$set:{
        "fullName":req.body.fullName,
        "picUrl":req.body.picUrl,
        "countryCode":req.body.countryCode,
        "mobileNo":req.body.mobileNo,
        "email": req.body.email,  
        "jobType":req.body.jobType,
        "dob":req.body.dob,
        "location":req.body.location   
    }})
    res.status(200).json({message:"update successful"})
    }
    else{
    res.status(404).json({message:"member not present."})
    }
    clientInfo.close();
    }
    catch(e){
       console.log(e);
    }
})

//below API is usedfor deleting desired query.
app.delete('/api/deleteMember/:id',async(req,res)=>{
    try{
    const clientInfo = await mongoClient.connect(db_url);
    const db = clientInfo.db("app");
    let item = await db.collection("members").find({userId:+req.params.id}).project({userId:1}).toArray(); 
    if(item.length){
    await db.collection("members").findOneAndDelete({userId:+req.params.id});
    res.status(200).json({result:"delete successful."});
    }
    else{
    res.status(404).json({message:"member not present."})
    }
    clientInfo.close();
    }
    catch(e){
        console.log(e);
    }
})

app.listen(port,()=>console.log(`App is listening on ${port}`));