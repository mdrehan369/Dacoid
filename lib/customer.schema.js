import mongoose, { Schema } from "mongoose";
import { hash } from "bcrypt";

const customerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    number: Number,
    tickets: [Schema.Types.ObjectId]
});

customerSchema.pre('save', async function(next){

    const hashedPassword =  await hash(this.password, 10)
    this.password = hashedPassword

    next();
})

export const customerModel = new mongoose.model("Customer", customerSchema);

