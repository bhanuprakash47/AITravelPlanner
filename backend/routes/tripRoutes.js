import express from "express"
import {generateNewTrip,updateTrip,regenerateTrip,allTrips, deleteTrip} from "../controllers/tripController.js"
import verifyToken from "../middleware/auth.js"

const tripRouter=express.Router()

//get all trips
tripRouter.get("/",verifyToken, allTrips)

//create newTrip
tripRouter.post("/new",verifyToken,generateNewTrip)
//update trip by id
tripRouter.put("/:id",verifyToken,updateTrip)
//regenerate trip by id 
tripRouter.post("/:id/regenerate",verifyToken,regenerateTrip)

//delete trip
tripRouter.delete("/:id", verifyToken, deleteTrip);

export default tripRouter