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


registRouter.post('/update', async (req, res, next) => {

    const { allData } = req.body;
    console.log(allData);

    const itemIdx = allData.idx;
    ['idx', 'sum', 'product', 'created_at', 'updated_at'].forEach(key => delete allData[key]);

    const queryStr = getQueryStr(allData, 'update', 'updated_at')
    console.log(queryStr);

    queryStr.values.push(itemIdx)

    try {
        const updateQuery = `UPDATE site SET ${queryStr.str} WHERE idx = ?`
        await sql_con.promise().query(updateQuery, queryStr.values);
    } catch (error) {

    }




    res.json({})
})

registRouter.post('/load_modify_content', async (req, res, next) => {
    const { userId, modifyIdx } = req.body;
    let modifyContent = {}
    try {
        const loadModifyContentQuery = "SELECT * FROM site WHERE user_id = ? AND idx = ?";
        const [loadModifyContent] = await sql_con.promise().query(loadModifyContentQuery, [userId, modifyIdx]);
        modifyContent = loadModifyContent[0]
        console.log(modifyContent);

    } catch (error) {

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

    let allData = req.body.allData;
    const THUMB_SIZE = { w: 144, h: 112 };


    try {
        // 썸네일 만들어서 저장!
        const gcsPath = allData.imgs.split(',')[0]

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
        const thumbName = `imgs/imgs${today}/thumb-${originFile}`;
        const thumbFile = bucket.file(thumbName);

        // 업로드 하기!!!
        await thumbFile.save(thumbBuffer, {
            contentType: 'image/jpeg',
            resumable: false,
            predefinedAcl: 'publicRead',          // ← 핵심
            metadata: { cacheControl: 'public,max-age=31536000' }
        });

        allData['thumbnail'] = thumbName

    } catch (err) {
        console.error(err.message);

    }
    try {
        const queryStr = getQueryStr(allData, 'insert', 'created_at')
        const siteInsertQuery = `INSERT INTO site (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(siteInsertQuery, queryStr.values);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ message: '업로드 실패! 다시 시도 해주세요!' })
    }

    return res.json({})

})







registRouter.post('/board_upload', async (req, res, next) => {

})

export { registRouter }