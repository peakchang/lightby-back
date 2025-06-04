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


registRouter.post('/upload', async (req, res, next) => {
    let allData = req.body.allData;

    const THUMB_SIZE = { w: 144, h: 128 };
    console.log(allData);

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
        console.log(thumbName);

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
        // console.log(queryStr);
        const siteInsertQuery = `INSERT INTO site (${queryStr.str}) VALUES (${queryStr.question})`;
        console.log(siteInsertQuery);
        await sql_con.promise().query(siteInsertQuery, queryStr.values);
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ message: '업로드 실패! 다시 시도 해주세요!' })
    }

    return res.json({})

})

export { registRouter }