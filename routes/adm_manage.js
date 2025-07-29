import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const admManageRouter = express.Router();



admManageRouter.post('/update_ad_date', async (req, res, next) => {
    const { idx, ad_start_date, ad_end_date } = req.body;

    console.log(idx);
    console.log(ad_start_date);
    console.log(ad_end_date);

    try {
        const updateAdDateQuery = "UPDATE site SET ad_start_date = ?, ad_end_date = ? WHERE idx = ?";
        await sql_con.promise().query(updateAdDateQuery, [ad_start_date, ad_end_date, idx]);
    } catch (err) {
        console.error(err.message);
    }

    res.status(200).json({})

})

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

        if (delImgs) {
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
        }


        const deleteQuery = "DELETE FROM site WHERE idx = ?";
        await sql_con.promise().query(deleteQuery, [idx]);

    } catch (err) {
        console.error(err.message);
    }
    res.json({})
})


admManageRouter.post('/load_joboffer_list', async (req, res, next) => {

    const nowPage = req.body.nowPage || 1;
    const searchVal = req.body.searchVal || "";
    const searchType = req.body.searchType || "";
    const product = req.body.product || "";

    let searchStr = ""
    if (searchVal && searchType) {
        if (searchType == 'subject') {
            searchStr = `WHERE site.${searchType} LIKE "%${searchVal}%"`;
        } else {
            searchStr = `WHERE users.${searchType} LIKE "%${searchVal}%"`;
        }
    }

    if(product && product != 'all'){
        if(!searchStr){
            searchStr = `WHERE product = '${product}'`
        }else{
            searchStr = `AND product = '${product}'`
        }
    }

    let allCount = 0;
    let maxPage = 0;
    let onePageCount = 15;

    const startNum = (nowPage - 1) * onePageCount;


    let jobOfferList = [];
    try {

        const getJobOfferCountQuery = `SELECT COUNT(*) AS job_count FROM site LEFT JOIN users ON site.user_id = users.idx ${searchStr}`

        const [getJobOfferCount] = await sql_con.promise().query(getJobOfferCountQuery);
        allCount = getJobOfferCount[0]['job_count'];

        maxPage = Math.ceil(allCount / onePageCount);

        const loadJobofferListQuery = `SELECT
            site.*,
            users.idx AS user_idx,
            users.id AS user_id,
            users.nickname AS user_nickname,
            users.name AS user_name,
            users.phone AS user_phone
        FROM site
        LEFT JOIN users ON site.user_id = users.idx
        ${searchStr}
        ORDER BY site.idx DESC LIMIT ${startNum}, ${onePageCount};
        `;
        const [loadJobofferList] = await sql_con.promise().query(loadJobofferListQuery);

        console.log(loadJobofferList.length);


        if (loadJobofferList.length > 0) {
            jobOfferList = loadJobofferList
        }

        console.log(jobOfferList);
        


    } catch (err) {
        console.error(err.message);

    }
    res.json({ jobOfferList, allCount, maxPage })
})



export { admManageRouter }