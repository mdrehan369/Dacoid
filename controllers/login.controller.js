import { customerModel } from '../lib/customer.schema.js';
import { compare } from 'bcrypt';

export const loginController = async (req, res) => {
    const { email, password, type } = req.body;

    if(type == 'admin') {
        if(email == 'mdrehan4650@gmail.com' && password == '12345') {
            res.redirect("/admin");
        } else {
            res.render("login", {msg:"Email or password does not match"});
        }
    } else {
        let customer = await customerModel.findOne({email});
        if(customer) {
            if(compare(password, customer.password)) {
                req.session.user = customer;
                res.redirect("/customer");
            }else{
            res.render("login", {msg:"Email or password does not match"});
            }
        } else {
            res.render("login", {msg:"No User Found"});
        }
    }
}

