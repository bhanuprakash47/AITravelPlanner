import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import connectDB from "./config/db.js"
import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app=express()
const PORT=process.env.PORT


const initializeServerAndDB=async()=>{
    try{
        await connectDB()

        app.listen(PORT,()=>{
            console.log("server is running on port",PORT)
        })
    }catch(err){
        console.error("Server failed to start",err.message)
        process.exit(1)
    }
}

initializeServerAndDB()