import express from "express";
import { getQueryStr, imageUpload } from "../back-lib/lib.js";
const imgRouter = express.Router();
import { Storage } from "@google-cloud/storage";

/*
1. 이미지 한개만 업로드
2. 여러 이미지 한꺼번에 업로드

*/

imgRouter.post('/upload_single', imageUpload.single('onimg'), async (req, res, next) => {
    let saveUrl
    saveUrl = req.file.filename;
    res.json({ saveUrl })
})


imgRouter.post('/delete', async (req, res, next) => {

    const delPath = req.body.delPath
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
        return res.status(400).json({})
    }

    return res.json({})
})


imgRouter.post('/delete_many', async (req, res, next) => {
    const delImgList = req.body.delImgList
    
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
    return res.json({})
})


export { imgRouter }