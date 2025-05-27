import express from "express";
import { getQueryStr, imageUpload } from "../back-lib/lib.js";
const imgRouter = express.Router();


/*
1. 이미지 한개만 업로드
2. 여러 이미지 한꺼번에 업로드

*/

imgRouter.post('/upload/single', imageUpload.single('onimg'), async (req, res, next) => {
    let baseUrl
    let saveUrl

    console.log(req.file);
    

    console.log('[POST] /upload/image file: ' + JSON.stringify(req.file));
    baseUrl = req.file.path;
    saveUrl = req.file.filename;



    res.json({ baseUrl, saveUrl, message : 'gogogogogo' })
})


export { imgRouter }