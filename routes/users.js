import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'

const usersRouter = express.Router();

usersRouter.post('/update_user_info', async (req, res, next) => {

    console.log(req.body);
    const { idx, nickname, type } = req.body;


    if (type == 'nickname') {
        try {
            const updateNicknameQuery = "UPDATE users SET nickname = ? WHERE idx = ?";
            await sql_con.promise().query(updateNicknameQuery, [nickname, idx]);
            
        } catch (error) {

        }
    }



    res.json({})
})

export { usersRouter }