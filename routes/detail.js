import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'
import moment from "moment-timezone";

const detailRouter = express.Router();

detailRouter.post('/', async (req, res, next) => {

    const { idx, userId } = req.body;
    // console.log(idx);
    // console.log(userId);


    let detail = {}
    let favorateBool = false;

    try {
        const getDetailQuery = "SELECT * FROM site WHERE idx = ?";
        const [getDetail] = await sql_con.promise().query(getDetailQuery, [idx]);
        detail = getDetail[0]

        const favBoolChkQuery = "SELECT * FROM favorites WHERE user_id = ? AND item_id = ?";
        const [favBoolChk] = await sql_con.promise().query(favBoolChkQuery, [userId, idx]);

        console.log(favBoolChk);
        console.log(`favBoolChk 길이는? : ${favBoolChk.length}`);
        
        
        if (favBoolChk.length > 0) {
            favorateBool = true;
        }


    } catch (error) {

    }

    res.json({ detail, favorateBool })
})

detailRouter.post('/favorate', async (req, res, next) => {
    const body = req.body;
    console.log(body);
    const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');


    if (body.type == 'fav') {
        try {
            const insertQuery = "INSERT INTO favorites (user_id, item_id, created_at) VALUES (?,?,?)"
            await sql_con.promise().query(insertQuery, [body.user_id, body.item_id, now]);
        } catch (error) {
            return res.status(400).json({ message: "이미 찜한 현장 입니다." })
        }
    } else {
        try {
            const deleteQuery = "DELETE FROM favorites WHERE user_id = ? AND item_id = ?";
            await sql_con.promise().query(deleteQuery, [body.user_id, body.item_id]);
        } catch (error) {

        }
    }

    return res.json({})

})

export { detailRouter }