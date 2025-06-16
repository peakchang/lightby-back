import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'

const apiRouter = express.Router();

apiRouter.post('/payment_customerkey_chk', async (req, res, next) => {

    console.log('들어왔오!!!');
    const { userId } = req.body;
    console.log(userId);

    let customer_key = ""
    let user_name = ""

    try {
        const getUserCustomerKeyQuery = "SELECT customer_key, name FROM users WHERE idx = ?";
        const [getUserCustomerKey] = await sql_con.promise().query(getUserCustomerKeyQuery, [userId]);
        user_name = getUserCustomerKey[0]['name']
        if (getUserCustomerKey[0]['customer_key']) {
            customer_key = getUserCustomerKey[0]['customer_key']

        } else {
            customer_key = `usr_${userId}_${Date.now().toString(36)}`;
            console.log(customer_key);
            const updateUserCustomerKeyQuery = "UPDATE users SET customer_key = ? WHERE idx = ?";
            await sql_con.promise().query(updateUserCustomerKeyQuery, [customer_key, userId]);
        }
    } catch (err) {
        console.error(err.message);
    }
    res.json({ customer_key, user_name });
})

export { apiRouter }