import User from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"



export const registerUser=async(req,res)=>{
    try{
        console.log(req.body)
        const {name,email,password}=req.body
        //check fields are valid
        if(!name || !email || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
            
        }
        
        //check if user exist
        const normalizedEmail=email?.toLowerCase()
        const existingUser= await User.findOne({email:normalizedEmail})
        if(existingUser) return res.status(409).json({message:"User already Exists"})
         
        //Hash password    
        const hashedPassword= await bcrypt.hash(password,10)

        //Create User
        await User.create({
            name,
            email:normalizedEmail,
            password:hashedPassword
        })

        //respond with success message
        res.status(201).json({
            message:"User Registered Successfully",
        })

    }
    catch(err){
        console.log("err registerErr",err.message)
        res.status(500).json({message:"Server Error"})
    }
}

export const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body
        //validate input fields
        if(!email || !password) return res.status(400).json({message:"All fields are required"})
         
        //check secret key
        const secretKey = process.env.JWT_SECRET_KEY
        if(!secretKey){
            throw new Error("JWT secret missing. Set JWT_SECRET_KEY in backend/.env")
        }

        //check user exists
        const normalizedEmail=email?.toLowerCase()
        const user= await User.findOne({email:normalizedEmail})

        if(!user){
           return res.status(400).json({message:"Invalid email or password"})
        }

       

        //validate password
        const isPasswordMatch= await bcrypt.compare(password,user.password)
      
        if (!isPasswordMatch) {
            return res.status(400).json({message: "Invalid email or password",})
        }

        //generate token
        const token = jwt.sign({ id: user._id, email: user.email },secretKey,{ expiresIn: "1h" })

        res.status(200).json({message: "Logged in successfully",token,})

    }
    catch(err){
        console.log("err loginErr",err.message)
        res.status(500).json({message:"Server Error"})
    }
}
