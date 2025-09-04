import express from "express";
import { Storage } from "@google-cloud/storage";
import sharp from 'sharp';
import { sql_con } from "../back-lib/db.js";
import { getQueryStr } from "../back-lib/lib.js";
import axios from 'axios'
import qs from 'qs'

import moment from 'moment-timezone';


const registRouter = express.Router();

const storage = new Storage({
    projectId: process.env.GCS_PROJECT,
    keyFilename: process.env.GCS_KEY_FILE,
});


registRouter.post('/delete', async (req, res, next) => {
    const { idx, delImgs, delThumbnail } = req.body;

    let delImgList = []
    try {


        if (delImgs) {
            delImgList = delImgs.split(',')
        }

        if (delThumbnail) {
            delImgList.push(delThumbnail)
        }

        for (let i = 0; i < delImgList.length; i++) {
            const delPath = delImgList[i];
            const storage = new Storage({
                projectId: process.env.GCS_PROJECT,
                keyFilename: process.env.GCS_KEY_FILE,
            });
            const bucketName = process.env.GCS_BUCKET_NAME;
            const bucket = storage.bucket(bucketName);
            try {
                await bucket.file(delPath).delete()
            } catch (error) {
                console.error(error.message);
            }
        }

        const deleteQuery = "DELETE FROM site WHERE idx = ?";
        await sql_con.promise().query(deleteQuery, [idx]);


    } catch (error) {

    }
    res.json({})
})

registRouter.post('/update', async (req, res, next) => {

    const { allData } = req.body;

    console.log(allData);


    const itemIdx = allData.idx;
    ['idx', 'sum', 'product', 'created_at', 'updated_at', 'ad_start_date', 'ad_end_date'].forEach(key => delete allData[key]);

    const queryStr = getQueryStr(allData, 'update', 'updated_at')

    queryStr.values.push(itemIdx)

    try {
        const updateQuery = `UPDATE site SET ${queryStr.str} WHERE idx = ?`
        await sql_con.promise().query(updateQuery, queryStr.values);
    } catch (error) {
        console.error(error.message);
    }

    res.json({})
})



registRouter.post('/load_user_info', async (req, res, next) => {
    const { userId } = req.body;
    let userInfo = {}

    try {
        const loadSimpleUserInfoQuery = "SELECT * FROM users WHERE idx = ?";
        const [loadSimpleUserInfo] = await sql_con.promise().query(loadSimpleUserInfoQuery, [userId]);
        userInfo = loadSimpleUserInfo[0]
    } catch (error) {

    }
    res.json({ userInfo })
})

registRouter.post('/load_modify_content', async (req, res, next) => {
    const { userId, modifyIdx } = req.body;


    let modifyContent = {}
    try {

        if (userId == 'on') {
            const loadModifyContentQuery = "SELECT * FROM site WHERE idx = ?";
            const [loadModifyContent] = await sql_con.promise().query(loadModifyContentQuery, [modifyIdx]);
            modifyContent = loadModifyContent[0]
        } else {
            const loadModifyContentQuery = "SELECT * FROM site WHERE user_id = ? AND idx = ?";
            const [loadModifyContent] = await sql_con.promise().query(loadModifyContentQuery, [userId, modifyIdx]);
            modifyContent = loadModifyContent[0]
        }

    } catch (err) {
        console.error(err.message);
    }
    res.json({ modifyContent })
})

registRouter.post('/load_prev_post', async (req, res, next) => {
    const { postIdx } = req.body
    let prevPost = {}
    try {
        const loadPrevPostQuery = "SELECT * FROM site WHERE idx = ?";
        const [loadPrevPost] = await sql_con.promise().query(loadPrevPostQuery, [postIdx]);
        prevPost = loadPrevPost[0]

    } catch (error) {

    }
    res.json({ prevPost })
})
registRouter.post('/load_prev_list', async (req, res, next) => {
    let prevPostList = []
    let startNum = 0
    const { user_idx } = req.body;
    try {
        const loadPrevPostListQuery = `SELECT idx, subject, created_at FROM site WHERE user_id = ? ORDER BY idx DESC LIMIT ${startNum}, 10;`
        const [loadPrevPostList] = await sql_con.promise().query(loadPrevPostListQuery, [user_idx]);
        prevPostList = loadPrevPostList
    } catch (error) {

    }
    res.json({ prevPostList })
})

registRouter.post('/get_post_count', async (req, res, next) => {

    const { userId } = req.body;
    let postNum = 0
    try {
        const getPostNumQuery = "SELECT COUNT(*) as c FROM site WHERE user_id = ?;"
        const getPostNum = await sql_con.promise().query(getPostNumQuery, [userId]);
        postNum = getPostNum[0][0].c
    } catch (error) {

    }

    res.json({ postNum })
})

registRouter.post('/upload', async (req, res, next) => {

    console.log('업로드는 들어오지?!?!??!');


    let allData = req.body.allData;
    const THUMB_SIZE = { w: 144, h: 112 };

    console.log(allData);

    const orderId = allData.order_id;
    const paymentKey = allData.payment_key;
    const amount = allData.sum;

    console.log(`paymentKey : ${paymentKey}`);
    console.log(`orderId : ${orderId}`);
    console.log(`amount : ${amount}`);

    delete allData.order_id;




    try {
        // 썸네일 만들어서 저장!

        if (allData.imgs) {
            const gcsPath = allData.imgs.split(',')[0]
            let thumbName = ""
            if (gcsPath.split('.')[1] != 'gif') {
                const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
                const file = bucket.file(gcsPath);
                const [buffer] = await file.download();

                // // 2) 썸네일 생성 (가운데 잘라서 180x180)
                const thumbBuffer = await sharp(buffer)
                    .resize(THUMB_SIZE.w, THUMB_SIZE.h, { fit: 'cover', position: 'centre' })
                    .toFormat('jpeg', { quality: 80 })
                    .toBuffer();

                const originFile = gcsPath.split('/').pop();
                const today = moment().tz('Asia/Seoul').format('YYMMDD');
                thumbName = `imgs/imgs${today}/thumb-${originFile}`;
                const thumbFile = bucket.file(thumbName);

                // 업로드 하기!!!
                await thumbFile.save(thumbBuffer, {
                    contentType: 'image/jpeg',
                    resumable: false,
                    predefinedAcl: 'publicRead',          // ← 핵심
                    metadata: { cacheControl: 'public,max-age=31536000' }
                });
            }

            allData['thumbnail'] = thumbName
        }


    } catch (err) {
        console.error(err.message);
    }


    if (paymentKey && orderId) {
        const widgetSecretKey = process.env.TOSS_SECRET_KEY;
        const encryptedSecretKey =
            "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

        try {
            const response = await axios.post(
                "https://api.tosspayments.com/v1/payments/confirm",
                {
                    orderId: orderId,
                    amount: amount,
                    paymentKey: paymentKey,
                },
                {
                    headers: {
                        Authorization: encryptedSecretKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            // 결제 성공 비즈니스 로직
            console.log(response.data);

            const queryStr = getQueryStr(allData, 'insert', 'created_at')
            const siteInsertQuery = `INSERT INTO site (${queryStr.str}) VALUES (${queryStr.question})`;
            await sql_con.promise().query(siteInsertQuery, queryStr.values);

            return res.status(response.status).json(response.data);
        } catch (error) {
            // 결제 실패 비즈니스 로직
            console.error(error.response?.data || error.message);
            return res
                .status(error.response?.status || 500)
                .json(error.response?.data || { message: "결제 승인 실패" });
        }
    } else {

        const queryStr = getQueryStr(allData, 'insert', 'created_at')
        const siteInsertQuery = `INSERT INTO site (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(siteInsertQuery, queryStr.values);
        
        return res.status(200).json({});
    }




})







registRouter.post('/board_upload', async (req, res, next) => {

})

export { registRouter }