import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";
import moment from "moment-timezone";

const qnaRouter = express.Router();

qnaRouter.post('/upload_qna_answer', async (req, res, next) => {
    const { qnaAnswer, idx } = req.body;

    console.log('여기 진입은 하지?!');
    console.log(`qnaAnswer : ${qnaAnswer} / idx : ${idx}`);
    
    
    try {
        const uploadQnaAnswerQuery = "UPDATE qna SET answer = ? WHERE idx = ?";
        await sql_con.promise().query(uploadQnaAnswerQuery, [qnaAnswer, idx]);
    } catch (error) {
        console.error(error.message);
    }
    res.json({})
})

qnaRouter.post('/load_qna_list', async (req, res, next) => {

    const { userIdx } = req.body;

    let faqList = [];
    let qnaList = [];

    try {

        const getFaqListQuery = "SELECT * FROM qna WHERE faq_bool = TRUE ORDER BY idx DESC";
        const [getFaqList] = await sql_con.promise().query(getFaqListQuery);
        faqList = getFaqList


        const getQnaListQuery = "SELECT * FROM qna WHERE faq_bool = FALSE AND user_id = ? ORDER BY idx DESC";
        const [getQnaList] = await sql_con.promise().query(getQnaListQuery, [userIdx]);
        qnaList = getQnaList

    } catch (error) {

    }
    res.json({ faqList, qnaList })
})

qnaRouter.post('/upload', async (req, res, next) => {
    const { userId, questionVal } = req.body
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    try {
        const uploadQuestionQuery = "INSERT INTO qna (user_id, question, question_created_at) VALUES (?,?,?)";
        await sql_con.promise().query(uploadQuestionQuery, [userId, questionVal, now]);
    } catch (err) {
        console.error(err.message);
    }
    res.json({})
})

export { qnaRouter }