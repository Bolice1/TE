import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as env from './env'


// let us connect to the database 
const url = env.env.mongo_url;
const connection = async ()=>{
    try{

    await mongoose.connect(url);

    }catch(error){
        console.log(`Error occured: \n${error}`)
    }
    
}

