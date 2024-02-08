import mongoose, { Schema } from "mongoose";

const ticketSchema = new mongoose.Schema({
    subject: String,
    description: String,
    user: Schema.Types.ObjectId,
    token: String,
    type: String,
    status: String,
    date: String,
    location: String,
    time: String
});

export const ticketModel = new mongoose.model("Ticket", ticketSchema);

