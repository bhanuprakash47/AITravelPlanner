import express from "express"
import {generateNewTrip,updateTrip,regenerateTrip} from "../controllers/tripController.js"
import verifyToken from "../middleware/auth.js"

const tripRouter=express.Router()

//create newTrip
tripRouter.post("/new",verifyToken,generateNewTrip)
//update trip by id
tripRouter.post("/:id",verifyToken,updateTrip)
//regenerate trip by id 
tripRouter.post("/:id/regenerate",verifyToken,regenerateTrip)

export default tripRouter