import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const admManageRouter = express.Router();



// 게시판 관련~~~

admManageRouter.post('/delete_post', async (req, res, next) => {


    const { idx, delImgs } = req.body;
    try {


        const delImgList = delImgs.split(',')


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

        const deleteQuery = "DELETE FROM board_fee WHERE idx = ?";
        await sql_con.promise().query(deleteQuery, [idx]);


    } catch (error) {
        console.error(error.message);
    }
    res.json({})
})

admManageRouter.post('/load_post_list', async (req, res, next) => {
    const { page } = req.body;

    let postList = []
    try {
        const getPostListQuery = `SELECT
        board_fee.*,
        users.idx AS user_idx,
        users.id AS user_id,
        users.nickname AS user_nickname,
        users.name AS user_name
        FROM board_fee JOIN users ON board_fee.user_id = users.idx ORDER BY board_fee.idx DESC`;
        const [getPostList] = await sql_con.promise().query(getPostListQuery);
        if (getPostList.length > 0) {
            postList = getPostList
        }
    } catch (error) {

    }


    res.json({ postList })
})



// 구인 공고 관련~~~ 
admManageRouter.post('/delete_job', async (req, res, next) => {
    const { idx, delImgs, delThumbnail } = req.body;
    try {

        const delImgList = delImgs.split(',')
        delImgList.push(delThumbnail)

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
        
    } catch (err) {
        console.error(err.message);
    }
    res.json({})
})


admManageRouter.post('/load_joboffer_list', async (req, res, next) => {



    const { page } = req.body;
    let jobOfferList = [];
    try {
        const loadJobofferListQuery = `SELECT
        site.*,
        users.idx AS user_idx,
        users.id AS user_id,
        users.nickname AS user_nickname,
        users.name AS user_name
        FROM site JOIN users ON site.user_id = users.idx ORDER BY site.idx DESC`;
        const [loadJobofferList] = await sql_con.promise().query(loadJobofferListQuery);
        if (loadJobofferList.length > 0) {
            jobOfferList = loadJobofferList
        }


    } catch (err) {
        console.error(err.message);

    }
    res.json({ jobOfferList })
})



export { admManageRouter }