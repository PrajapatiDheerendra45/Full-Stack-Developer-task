
import mongoose from "mongoose"

export  async function connectDB() {

     try {
        await mongoose.connect(process.MONGO_URI|| "mongodb+srv://euro:Mayank898232@euroobsidian.aoyqnrt.mongodb.net/fullstack-task");
        console.log("MongoDB Connected Successully..!")
     } catch (error) {
        console.log(error)
        
     }
    
}