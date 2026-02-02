import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'
import moment from "moment-timezone";

const detailRouter = express.Router();

detailRouter.post('/', async (req, res, next) => {


    

    const { idx, userId } = req.body;
    let detail = {}
    let favorateBool = false;


    try {
        const getDetailQuery = "SELECT * FROM site WHERE idx = ?";
        const [getDetail] = await sql_con.promise().query(getDetailQuery, [idx]);
        detail = getDetail[0]

        

        const favBoolChkQuery = "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ? AND is_liked = TRUE";
        const [favBoolChk] = await sql_con.promise().query(favBoolChkQuery, [userId, idx]);


        if (favBoolChk.length > 0) {
            favorateBool = true;
        }

    } catch (error) {
        console.error(error.message);

    }

    res.json({ detail, favorateBool })
})



// post_like 없으면 생성 / 있는데 is_liked가 false 면 true / 있는데 is_liked가 true 면 false
detailRouter.post('/postlike_act', async (req, res, next) => {
    const { type, user_id, item_id } = req.body;

    const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

    if (type == 'fav') {
        // 찜하기 풀기

        try {
            const getPostLikeQuery = "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?";
            const [getPostLike] = await sql_con.promise().query(getPostLikeQuery, [user_id, item_id]);

            if (getPostLike.length == 0) {
                const insertPostLikeQuery = "INSERT INTO post_likes (user_id, post_id) VALUES (?,?)"
                await sql_con.promise().query(insertPostLikeQuery, [user_id, item_id]);
            } else {
                const postLikeLikedQuery = "UPDATE post_likes SET is_liked = TRUE WHERE user_id = ? AND post_id = ?"
                await sql_con.promise().query(postLikeLikedQuery, [user_id, item_id]);
            }
        } catch (error) {
            console.error(error.message);
        }
    } else {
        try {
            const postLikeUnlikedQuery = "UPDATE post_likes SET is_liked = FALSE WHERE user_id = ? AND post_id = ?";
            await sql_con.promise().query(postLikeUnlikedQuery, [user_id, item_id]);
        } catch (error) {
            console.error(error.message);
        }
    }





    res.json({})
})

// 안씀 안씀 안씀
detailRouter.post('/favorate', async (req, res, next) => {



    // if (body.type == 'fav') {
    //     try {
    //         const insertQuery = "INSERT INTO favorites (user_id, item_id, created_at) VALUES (?,?,?)"
    //         await sql_con.promise().query(insertQuery, [body.user_id, body.item_id, now]);
    //     } catch (error) {
    //         return res.status(400).json({ message: "이미 찜한 현장 입니다." })
    //     }
    // } else {
    //     try {
    //         const deleteQuery = "DELETE FROM favorites WHERE user_id = ? AND item_id = ?";
    //         await sql_con.promise().query(deleteQuery, [body.user_id, body.item_id]);
    //     } catch (error) {

    //     }
    // }

    return res.json({})

})

export { detailRouter }