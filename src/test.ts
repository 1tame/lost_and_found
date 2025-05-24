import express from "express";
import dotenv from "dotenv";
import {pool} from "./config/db";
import { json } from "stream/consumers";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", async (req, res) =>{
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        res.json({message: "server and DB are working", result: rows});
    } catch(error){
        res.status(500).json({error: "DB connection failed", details: error});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{
    console.log(`server running on hthp://localhost:${PORT}`);
});
