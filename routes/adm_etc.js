import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const admEtcRouter = express.Router();


// FAQ / QnA 부분!!

admEtcRouter.post('/load_modify_faq', async (req, res, next) => {
    const { idx } = req.body;
    console.log(idx);
    let faqData = {}
    try {
        const loadModifyFaqQuery = "SELECT * FROM qna WHERE idx = ?";
        const [loadModifyFaq] = await sql_con.promise().query(loadModifyFaqQuery, [idx]);
        if (loadModifyFaq.length > 0) {
            faqData = loadModifyFaq[0]
        }

    } catch (error) {

    }

    res.json({ faqData })
})

admEtcRouter.post('/load_qna_list', async (req, res, next) => {
    let faqList = []
    let qnaList = []
    try {
        const loadFaqListQuery = "SELECT * FROM qna WHERE faq_bool = TRUE ORDER BY idx DESC";
        const [loadFaqList] = await sql_con.promise().query(loadFaqListQuery);
        if (loadFaqList.length > 0) {
            faqList = loadFaqList
        }

        // const loadQnaListQuery = "SELECT * FROM qna WHERE faq_bool = FALSE ORDER BY idx DESC";
        const loadQnaListQuery = `SELECT qna.*, users.*
                FROM qna
                JOIN users ON qna.user_id = users.idx
                WHERE qna.faq_bool = FALSE
                ORDER BY qna.idx DESC;`;
        const [loadQnaList] = await sql_con.promise().query(loadQnaListQuery);
        if (loadQnaList.length > 0) {
            qnaList = loadQnaList
            console.log(qnaList);

        }
    } catch (error) {

    }
    res.json({ faqList, qnaList })
})


admEtcRouter.post('/upload_faq', async (req, res, next) => {

    const { user_id, faqQuestion, faqAnswer, type, modifyIdx } = req.body;

    console.log(faqQuestion);
    console.log(faqAnswer);

    try {

        if (type == 'upload') {
            const uploadFaqQuery = "INSERT INTO qna (user_id, question, answer, faq_bool) VALUES (?,?,?,?)";
            await sql_con.promise().query(uploadFaqQuery, [user_id, faqQuestion, faqAnswer, true]);
        } else {
            const updateFaqQuery = "UPDATE qna SET question = ?, answer = ? WHERE idx = ? ";
            await sql_con.promise().query(updateFaqQuery, [faqQuestion, faqAnswer, modifyIdx]);
        }


    } catch (error) {
        console.error(error.message);

    }




    res.json({})

})



// 배너 업로드!!


admEtcRouter.get('/load_basic_env', async (req, res, next) => {

    let basicEnv = {}
    try {
        const getBasicEnvQuery = "SELECT * FROM basic_env WHERE base = TRUE";
        const [getBasicEnv] = await sql_con.promise().query(getBasicEnvQuery);
        if (getBasicEnv.length > 0) {
            basicEnv = getBasicEnv[0]
        }

    } catch (error) {

    }


    res.json({ basicEnv })
})

admEtcRouter.post('/upload_banners', async (req, res, next) => {
    console.log('진입 하지?');

    const { bannerImgs, bannerLinks } = req.body;

    try {
        let updateQuery = "";
        const getBasicEnvQuery = "SELECT * FROM basic_env WHERE base = TRUE";
        const [getBasicEnv] = await sql_con.promise().query(getBasicEnvQuery);
        // 있으면 update, 없으면 insert
        if (getBasicEnv.length > 0) {
            updateQuery = "UPDATE basic_env SET banners = ?, banner_links = ? WHERE base = TRUE";
        } else {
            updateQuery = "INSERT INTO basic_env (banners, banner_links) VALUES (?,?)";
        }
        await sql_con.promise().query(updateQuery, [bannerImgs, bannerLinks]);
    } catch (error) {
        console.error(error.message);
    }
    res.json({})
})



export { admEtcRouter }