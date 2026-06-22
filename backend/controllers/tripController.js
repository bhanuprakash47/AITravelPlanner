import Trip from '../models/Trip.js';

const validSchema = `
    Return a JSON object that follows this structure exactly.

    {
      "destination": String,
      "durationDays": Number,
      "budgetTier": "Low" | "Medium" | "High",
      "interests": [String],

      "itinerary": [
        {
          "dayNumber": Number,
          "activities": [
            {
              "title": String,
              "description": String,
              "estimatedCostUSD": Number,
              "timeOfDay": "Morning" | "Afternoon" | "Evening"
            }
          ]
        }
      ],

      "hotels": [
        {
          "name": String,
          "tier": String,
          "estimatedCostNightUSD": Number,
          "rating": String
        }
      ],

      "estimatedBudget": {
        "transport": Number,
        "accommodation": Number,
        "food": Number,
        "activities": Number,
        "total": Number
      },

      "packingList": [
        {
          "item": String,
          "category": "Documents" | "Clothing" | "Gear" | "Other",
          "isPacked": Boolean
        }
      ]
    }

    Validation Rules

    - destination must be a string.

    - durationDays must be a positive integer.

    - budgetTier must be exactly one of:
      • Low
      • Medium
      • High

    - interests must be an array of strings.

    - itinerary must be an array.

    - Every itinerary object must contain:
      • dayNumber
      • activities

    - dayNumber must start from 1 and increase sequentially.

    - activities must be an array.

    - Every activity must contain:
      • title
      • description
      • estimatedCostUSD
      • timeOfDay

    - estimatedCostUSD must be a number greater than or equal to 0.

    - timeOfDay must be EXACTLY one of:
      • Morning
      • Afternoon
      • Evening

    Never generate values like:
    Late Morning
    Late Afternoon
    Morning/Afternoon
    Evening/Night
    Night
    Noon
    Midnight

    If needed:
    Late Morning → Morning
    Late Afternoon → Afternoon

    - hotels must be an array.

    - Every hotel must contain:
      • name
      • tier
      • estimatedCostNightUSD
      • rating

    - estimatedCostNightUSD must be a number greater than or equal to 0.

    - estimatedBudget must contain:
      • transport
      • accommodation
      • food
      • activities
      • total

    - Every budget value must be a number greater than or equal to 0.

    - total should approximately equal:

    transport + accommodation + food + activities

    - packingList must be an array.

    - Every packing item must contain:
      • item
      • category
      • isPacked

    - category must be EXACTLY one of:
      • Documents
      • Clothing
      • Gear
      • Other

    Automatically convert similar categories using these mappings:

    Electronics → Gear
    Technology → Gear
    Gadgets → Gear
    Camera → Gear
    Chargers → Gear
    Power Bank → Gear

    Money → Other
    Wallet → Other
    Currency → Other
    Finances → Other

    Health → Other
    Medical → Other
    Medicine → Other
    First Aid → Other
    Personal Care → Other
    Toiletries → Other

    Accessories → Other
    Travel Essentials → Other
    Essentials → Other

    - isPacked must always be true or false.

    Do not remove required fields.

    Return only valid JSON.

    Do not include markdown.

    Do not include explanations.

    Do not include code blocks.
    `;

// Exponential backoff executor for external API resilience
const fetchWithRetry=async(url, options, retries = 5, delay = 1000) =>{
  try {
    const response = await fetch(url, options);
    console.log("response",response)
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Wait and retry on rate limits
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`External API Error: Status Code ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}


//create new trip
export const generateNewTrip= async(req, res)=> {
  const { destination, durationDays, budgetTier, interests=[] } = req.body;
  const userId = req.user.id; // Populated from authentication middleware securely
  console.log("body",req.body)

  const prompt = `
    Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
    Budget preference is ${budgetTier}. Interests are: ${interests.join(', ')}.

    You must output ONLY a valid JSON object matching this structure:
    {
      "itinerary": [
        {
          "dayNumber": 1,
          "activities": [
            {
              "title": "Activity name",
              "description": "Brief text details",
              "estimatedCostUSD": 20,
              "timeOfDay": "Morning"
            }
          ]
        }
      ],
      "hotels": [
        {
          "name": "Recommended Hotel",
          "tier": "Budget",
          "estimatedCostNightUSD": 85,
          "rating": "4.5/5"
        }
      ],
      "estimatedBudget": {
        "transport": 120,
        "accommodation": 300,
        "food": 150,
        "activities": 100,
        "total": 670
      },
      "packingList": [
        {
          "item": "Passport",
          "category": "Documents",
          "isPacked": false
        }
      ]
    }

    Make sure estimates match typical realistic local rates for the specified budgetTier.

    IMPORTANT RESPONSE VALIDATION RULES (MANDATORY):

    Return ONLY valid JSON. Do not include markdown, explanations, or code blocks.

    For every activity:

    The "timeOfDay" field MUST be EXACTLY one of these values:
    - Morning
    - Afternoon
    - Evening

    Never use values such as:
    - Late Morning
    - Late Afternoon
    - Morning/Afternoon
    - Late Morning/Afternoon
    - Evening/Night
    - Night
    - Noon
    - Midnight
    - Any other variation

    If an activity occurs during late morning, use "Morning".
    If an activity occurs during late afternoon, use "Afternoon".

    -------------------------------------------------

    For every packing list item:

    The "category" field MUST be EXACTLY one of these values:
    - Documents
    - Clothing
    - Gear
    - Other

    If an item naturally belongs to another category, convert it using these mappings before generating the JSON:

    Electronics → Gear
    Technology → Gear
    Gadgets → Gear
    Camera → Gear
    Phone Accessories → Gear
    Chargers → Gear
    Power Bank → Gear

    Money → Other
    Finances → Other
    Currency → Other
    Wallet → Other

    Health → Other
    Medical → Other
    Medicine → Other
    First Aid → Other
    Personal Care → Other
    Toiletries → Other

    Accessories → Other
    Travel Essentials → Other
    Essentials → Other
    Information → Other
    Maps → Other

    Do NOT create any category outside:
    Documents
    Clothing
    Gear
    Other

    The response MUST strictly follow these rules so that it passes schema validation without any modifications.
    The JSON response must strictly follow this schema. ${validSchema}
    `;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };
    console.log("RequestPayload:",requestPayload)

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    console.log("data",data)


    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error("Could not extract generation data from response.");
    }

    const cleanResult = JSON.parse(parsedResponseText);
    console.log("cleanResult",cleanResult,"stopcleanresult")

    // Save user isolated trip directly into MongoDB
    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests,
      itinerary: cleanResult.itinerary,
      hotels: cleanResult.hotels,
      estimatedBudget: cleanResult.estimatedBudget,
      packingList: cleanResult.packingList
    });

    console.log("newtrip",newTrip)

    console.log("newerewirk")

    const savedTrip = await newTrip.save();
    console.log("savedTrip",savedTrip)
    return res.status(201).json(savedTrip);

  } catch (error) {
    console.error("Critical AI Generation Error:", error);
    return res.status(500).json({ message: "Fail-safe: API encountered an error processing your trip. Please try again." });
  }
}


//update trip details
export const updateTrip = async (req, res) => {
    try {
        // Allow only these fields to be updated
        const allowedFields = [
            "destination",
            "durationDays",
            "budgetTier",
            "interests",
            "itinerary",
            "hotels",
            "estimatedBudget",
            "packingList"
        ];

        // Build update object
        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Nothing to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update."
            });
        }

        // Update only if trip belongs to logged-in user
        const updatedTrip = await Trip.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id
            },
            { $set: updates },
            {
                returnDocument:"after",
                runValidators: true
            }
        );

        if (!updatedTrip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }

        return res.status(200).json({
            message: "Trip updated successfully.",
            trip: updatedTrip
        });

    } catch (err) {
        console.error("Update Trip Error:", err);

        return res.status(500).json({
            message: "Internal Server Error."
        });
    }
};

//regenerate trip using llm
export const regenerateTrip=async(req,res)=>{
  try{
    //get trip from db

    const {instruction}=req.body

    if(!instruction||!instruction.trim()){
      return res.status(400).json({
        message:"Instruction is required."
      })
    }

    const requiredTrip=await Trip.findOne({
      _id:req.params.id,
      userId:req.user.id
    })

    if(!requiredTrip){
      return res.status(404).json({
        message:"Trip not found"
      })
    }

    const prompt = `
        You are an expert AI travel planner.

        Below is the user's current trip.

        ${JSON.stringify(requiredTrip, null, 2)}

        The user wants to modify this trip.

        User request:
        "${instruction}"

        Read the existing trip carefully and understand what the user is asking.

        Update the trip to satisfy the user's request while keeping the trip realistic, consistent and well organized.

        Only change the parts of the trip that are necessary.

        Do not make unnecessary changes to unrelated sections.

        Even if only one small part changes, return the COMPLETE updated trip.

        Keep the same JSON structure as the original trip.

        The response must include:

        - destination
        - durationDays
        - budgetTier
        - interests
        - itinerary
        - hotels
        - estimatedBudget
        - packingList

        For every activity, timeOfDay must be exactly one of:

        - Morning
        - Afternoon
        - Evening

        If an activity would normally occur during Late Morning or Late Afternoon, convert it to Morning or Afternoon.

        For every packing list item, category must be exactly one of:

        - Documents
        - Clothing
        - Gear
        - Other

        Use these mappings whenever necessary:

        Electronics → Gear
        Technology → Gear
        Gadgets → Gear
        Camera → Gear
        Chargers → Gear
        Power Bank → Gear

        Money → Other
        Wallet → Other
        Currency → Other
        Finances → Other
        Health → Other
        Medical → Other
        Medicine → Other
        First Aid → Other
        Personal Care → Other
        Toiletries → Other
        Accessories → Other
        Travel Essentials → Other
        Essentials → Other

        Do not generate any category outside:
        - Documents
        - Clothing
        - Gear
        - Other

        

        Do not include markdown.

        Do not include explanations.

        Do not wrap the response inside code blocks.
        Return only valid JSON.

        The JSON response must strictly follow this schema.  ${validSchema}
        `;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };
    console.log("RequestPayload:",requestPayload)

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });
    
    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error("Could not extract generation data from response.");
    }

    const cleanResult = JSON.parse(parsedResponseText);
    console.log("cleanResult",cleanResult,"stopcleanresult")

    //saving to db
    Object.assign(requiredTrip,cleanResult)
    
    await requiredTrip.save()

    return res.status(200).json({
      message:"Trip regenerated successfully.",
      trip:requiredTrip
    })



  }catch(error){
    console.error("Critical AI Generation Error:", error);
    return res.status(500).json({ message: "Fail-safe: API encountered an error processing your trip. Please try again." });
  }
}


//Get all trips
export const allTrips=async(req,res)=>{
  try{
    const tripsList= await Trip.find({
      userId:req.user.id
    }).sort({createdAt:-1})

    if(tripsList.length===0){
      return res.status(200).json({
        tripsList:[]
      })
    }

    return res.status(200).json({tripsList})
  }catch(error){
    console.log("err fetching all trips",error)
   return res.status(500).json({message:"Failed to fetch all trips"})
  }
}

//delete trip 
export const deleteTrip=async(req,res)=>{
  try{
    const userId=req.user.id 
    const tripId=req.params.id

    const deleted = await Trip.findOneAndDelete({
      userId,
      _id:tripId
    })

    if(!deleted){
      return res.status(404).json({
        message:"Trip not found"
      })
    }

   return res.status(200).json({message:"trip deleted successfully"})
  }catch(error){
    console.log("err deleting trip",error)
   return res.status(500).json({message:"Failed to delete"})
  }
}