import { customerModel } from '../lib/customer.schema.js';

export const signupController = async (req, res) => {
    const { firstName, lastName, email, password, number } = req.body;

    let user = await customerModel.findOne({email});
    if(!user) {
        let customer = new customerModel({firstName, lastName, email, password, number});
        try{
            await customer.save();
            req.session.user = customer;
            res.redirect("/customer");
        } catch (e) {
            console.log(e);
        }
    } else {
        res.render("signup", {msg: "User already exists"});
    }
}

