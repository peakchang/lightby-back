import express from "express";
import { getQueryStr, imageUpload } from "../back-lib/lib.js";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";


const admEtcRouter = express.Router();


// talent 부분!!

admEtcRouter.post('/upload_talent_include_image', imageUpload.single('onimg'), async (req, res, next) => {
    const body = req.body;

    const saveUrl = req.file.filename;

    console.log(body);
    console.log(saveUrl);

    const delPath = req.body.prev_img

    if (delPath) {
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

    try {
        const updateTalentQuery = "UPDATE users SET profile_image = ?, name = ?, gender = ?, age = ?, career = ?, introduction = ? WHERE idx = ?";
        await sql_con.promise().query(updateTalentQuery, [saveUrl, body.name, body.gender, body.age, body.career, body.introduction, body.idx]);
    } catch (error) {
        console.error(error.message);
    }







    res.json({})
})

admEtcRouter.post('/upload_talent_no_image', async (req, res, next) => {
    const { name, gender, age, career, introduction, idx } = req.body;

    console.log(req.body);


    try {
        const updateTalentQuery = "UPDATE users SET name = ?, gender = ?, age = ?, career = ?, introduction = ? WHERE idx = ?";
        await sql_con.promise().query(updateTalentQuery, [name, gender, age, career, introduction, idx]);
    } catch (error) {
        console.error(error.message);
    }

    res.json({})
})


admEtcRouter.post('/get_talent', async (req, res, next) => {
    const { userIdx } = req.body;
    console.log(userIdx);
    let userInfo = {}

    try {
        const getUserInfoQuery = "SELECT * FROM users WHERE idx = ?";
        const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [userIdx]);
        userInfo = getUserInfo[0]
    } catch (error) {

    }
    res.json({ userInfo })
})


// FAQ / QnA 부분!!

admEtcRouter.post('/load_modify_faq', async (req, res, next) => {
    const { idx } = req.body;
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
        const loadQnaListQuery = `SELECT qna.*,
                users.idx AS user_idx,
                users.id AS user_id,
                users.nickname AS user_nickname,
                users.name AS user_name
                FROM qna
                JOIN users ON qna.user_id = users.idx
                WHERE qna.faq_bool = FALSE
                ORDER BY qna.idx DESC;`;
        const [loadQnaList] = await sql_con.promise().query(loadQnaListQuery);
        if (loadQnaList.length > 0) {
            qnaList = loadQnaList
        }
    } catch (error) {

    }
    res.json({ faqList, qnaList })
})


admEtcRouter.post('/upload_faq', async (req, res, next) => {

    const { user_id, faqQuestion, faqAnswer, type, modifyIdx } = req.body;

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