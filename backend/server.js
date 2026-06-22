import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import connectDB from "./config/db.js"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"


import router from './routes/authRoutes.js';
import tripRouter  from './routes/tripRoutes.js';

dotenv.config()


const app=express()
app.use(cors())
app.use(express.json())

app.use("/api/auth",router)
app.use("/api/trips",tripRouter)

const PORT=process.env.PORT || 5000


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