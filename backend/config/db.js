import mongoose from "mongoose"


const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connection successful")
    }catch(err){
        console.log("err in connnecting DB",err)
        process.exit(1)
    }
}

export default connectDB