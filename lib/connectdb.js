import mongoose from "mongoose";

export const connect = async (URI) => {
    try{
        await mongoose.connect(URI);
        console.log("Connected to MongoDB");
    } catch(e) {
        console.log(e);
    }
}

