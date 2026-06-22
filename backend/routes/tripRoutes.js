import express from "express"
import {generateNewTrip} from "../controllers/tripController.js"
import verifyToken from "../middleware/auth.js"

const tripRouter=express.Router()

//get trip iteneray
tripRouter.post("/newTrip",verifyToken,generateNewTrip)

export default tripRouter