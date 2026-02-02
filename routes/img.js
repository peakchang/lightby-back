import express from "express";
import { getQueryStr } from "../back-lib/lib.js";


const imgRouter = express.Router();
import { Storage } from "@google-cloud/storage";
import multer from 'multer';
import path from 'path';
import moment from "moment-timezone";

/*
1. 이미지 한개만 업로드
2. 여러 이미지 한꺼번에 업로드
*/


const storage = new Storage({
    projectId: process.env.GCS_PROJECT,
    keyFilename: process.env.GCS_KEY_FILE,
});

const bucketName = process.env.GCS_BUCKET_NAME
const bucket = storage.bucket(bucketName);

// Multer 설정 (메모리 스토리지 사용)
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 제한
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});





imgRouter.post('/upload_single', imageUpload.single('onimg'), async (req, res, next) => {
    let saveUrl = ""

    const body = req.body;
    const folder = req.body.folder;
    const now = moment().format('YYMMDD')


    try {
        if (!req.file) {
            return res.status(400).json({ error: '파일이 없습니다.' });
        }

        // 고유한 파일명 생성
        saveUrl = `${folder}/imgs${now}/${req.file.originalname}`

        
        // GCS에 파일 업로드
        const blob = bucket.file(saveUrl);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error('업로드 에러:', err);
            res.status(500).json({ error: '업로드 실패' });
        });

        blobStream.on('finish', async () => {
            // 파일을 공개로 설정 (선택사항)
            await blob.makePublic();

            res.status(200).json({
                message: '업로드 성공',
                saveUrl,
            });
        });

        blobStream.end(req.file.buffer);

    } catch (error) {
        console.error('서버 에러:', error);
        res.status(500).json({ error: '서버 에러 발생' });
    }
    // saveUrl = req.file.filename;
    // res.json({ saveUrl })
})


imgRouter.post('/delete', async (req, res, next) => {

    const delPath = req.body.delPath

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