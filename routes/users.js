import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'

const usersRouter = express.Router();


usersRouter.post('/set_interesting', async (req, res, next) => {
    console.log('안들어왕?!?!?');

    const { user_id, insertestStr } = req.body
    console.log(user_id);
    console.log(insertestStr);

    try {
        const updateInterestQuery = "UPDATE users SET interest = ? WHERE idx = ?";
        await sql_con.promise().query(updateInterestQuery, [insertestStr, user_id]);
    } catch (error) {

    }



    res.json({})
})


usersRouter.post('/update_user_info', async (req, res, next) => {
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