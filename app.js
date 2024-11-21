/* RESTful API Server */

import {
    getUser,
    registerNewUser,
    getCategories,
    getWasteItemsByCategory,
    createNewWasteRecord,
    getCommonWasteHistory,
    getBulkWasteHistory
} from "./database.js";

import express from "express";
import cors from "cors";

//Create an instance of the express application
const app = express();


//?Middlewares: 

//app will only process requests that have JSON as their body type
app.use(express.json())

//Specify the request detauls that will be accepted by the API
const corsOptions = {
    origin: "http://127.0.0.1:5173",
    methods: ["POST", "GET"], //Allowed requests to the API
    credentials: true //Allow sending credentials (cookies, authentication)
}

app.use(cors(corsOptions))


//? GET requests:
app.get("/users", async (req, res) => {
    //Retrieve query parameters
    const {email, password} = req.query;

    if (!email || !password) 
        return res.status(400).json({ error: "Email and password are required" });
    
    try {
        const user = await getUser(email, password);
        if(user)
            res.status(200).json(user);
        else
            res.status(404).json({error: "User not found"});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
})

app.get("/categories", async (req, res) => {
    try {
        const categories = await getCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

app.get("/wasteItems/:categoryID", async (req, res) => {

    try{
        const wasteItems = await getWasteItemsByCategory(req.params.categoryID);
        if(wasteItems.length !== 0)
            res.status(200).json(wasteItems);
        else
            res.status(404).json({error: "No waste items are assigned to that category"});
    }catch{
        res.status(500).json({error: "Failed to fetch the waste items"})
    }
});

app.get("/commonWasteHistory/:username", async (req, res) => {
    try {
        const wasteHistory = await getCommonWasteHistory(req.params.username);
        if (wasteHistory.length !== 0)
            res.status(200).json(wasteHistory)
        else 
            res.status(404).json({error: "The user has no common waste history"})
    } catch (error) {
        res.status(500).json({error: "Failed to fetch the waste history"})
    }
});

app.get("/bulkWasteHistory/:username", async (req, res) => {
    try {
        const wasteHistory = await getBulkWasteHistory(req.params.username);
        if (wasteHistory.length !== 0)
            res.status(200).json(wasteHistory)
        else 
            res.status(404).json({error: "The user has no common waste history"})
    } catch (error) {
        res.status(500).json({error: "Failed to fetch the waste history"})
    }
})

//? POST requests:
app.post("/register", async (req, res) => {
    
    const { username, password, email } = req.body;

    if (!username || !password || !email) 
        return res.status(400).json({ error: "Username, password, and email are required" });

    try {
        const userRegistered = await registerNewUser(username, password, email);
        if (userRegistered)
            res.status(201).json({message: "User registered successfully"});
        else
            res.status(409).json({message : "User already exists"})
    } catch (error) {
        res.status(500).json({ error: "Failed to register user" });
    }
});

app.post("/wasteRecords" , async (req, res) => {
    const {username, wasteItemID, unitOfMeasurement, categoryID} = req.body;
    try {
        const recordCreated = createNewWasteRecord(username, wasteItemID, unitOfMeasurement, categoryID);
        if(recordCreated)
            res.status(201).json({message: "Record created successfully"})

    } catch (error){
        res.status(500).json({error: "Failed to create a new record"})
    }
})


//Starts the server on port 8080
app.listen(8080, () => {
    console.log("Server running on port 8080")
});










