import cors from "cors";
import cookieParser from 'cookie-parser';
import express from 'express';
import routes from "./routes/index.js"
import dotenv from "dotenv";

dotenv.config();

export const app  = express();
app.use(express.json());
app.use(routes);
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(cors({
    origin:[process.env.FRONTENDURL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
}))

// app.use(routes);
app.use("/",(req,res)=>{
    res.send("nice working");
})
app.listen(5000,()=>{
    console.log("server is working ");
})