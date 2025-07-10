import express from "express";
import { sql_con } from "../back-lib/db.js";
import moment from "moment-timezone";


const boardRouter = express.Router();

boardRouter.post('/like_action', async (req, res, next) => {

    const { user_id, post_id } = req.body;

    console.log(user_id, post_id);

    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    try {
        const chkLikeQuery = "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?";
        const [chkLike] = await sql_con.promise().query(chkLikeQuery, [user_id, post_id]);

        console.log(chkLike);

        if (chkLike.length > 0 && chkLike[0]['is_liked'] == true) {
            console.log('첫번째 여기!');

            const updateLikeDelQuery = "UPDATE post_likes SET is_liked = FALSE WHERE user_id = ? AND post_id = ?"
            await sql_con.promise().query(updateLikeDelQuery, [user_id, post_id]);

        } else if (chkLike.length > 0 && chkLike[0]['is_liked'] == false) {
            console.log('두번째 여기!');

            const updateLikeDelQuery = "UPDATE post_likes SET is_liked = TRUE WHERE user_id = ? AND post_id = ?"
            await sql_con.promise().query(updateLikeDelQuery, [user_id, post_id]);

        } else {
            const insertListQuery = "INSERT INTO post_likes (user_id, post_id, created_at) VALUES (?,?,?)";
            await sql_con.promise().query(insertListQuery, [user_id, post_id, now]);
        }

    } catch (error) {
        console.error(error.message);

        console.log('에런데?');

    }
    res.json({})
})

boardRouter.post('/upload_reply', async (req, res, next) => {
    console.log('댓글 등록 진입!');
    const { bo_id, user_id, replyContent } = req.body
    console.log(bo_id);
    console.log(user_id);
    console.log(replyContent);
    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    try {
        const replyInsertQuery = "INSERT INTO reply (user_id, bo_id, content, created_at) VALUES (?,?,?,?)";
        await sql_con.promise().query(replyInsertQuery, [user_id, bo_id, replyContent, now]);
    } catch (error) {

    }



    res.json({})
})

boardRouter.post('/load_item', async (req, res, next) => {
    console.log('여기 들어오자규!!');

    let boardItem = {};
    let replyList = [];
    let { boardIdx } = req.body
    try {
        const getBoardItemQuery = `SELECT bf.*, u.nickname, u.profile_thumbnail
        FROM
        board_fee bf
        LEFT JOIN
        users u ON bf.user_id = u.idx
        WHERE
        bf.idx = ?`
        const [getBoardItem] = await sql_con.promise().query(getBoardItemQuery, [boardIdx.id]);
        boardItem = getBoardItem[0]

        console.log(boardItem);



        const getReplyListQuery = `SELECT r.*, u.nickname, u.profile_thumbnail 
        FROM reply r
        LEFT JOIN
        users u ON r.user_id = u.idx
        WHERE bo_id = ?`;
        const [getReplyList] = await sql_con.promise().query(getReplyListQuery, [boardItem.idx]);
        replyList = getReplyList

    } catch (error) {

    }
    return res.json({ boardItem, replyList })
})


boardRouter.post('/load_list', async (req, res, next) => {

    let { startNum } = req.body
    console.log(startNum);

    let board_list = [];
    try {
        // const loadBoardList = `SELECT * FROM board_fee ORDER BY idx DESC LIMIT ${startNum}, 10`;
        const loadBoardList =
            `SELECT bf.*, 
            u.nickname, u.profile_thumbnail, u.profile_image,
            COUNT(r.idx) AS reply_count
            FROM
            board_fee bf
            LEFT JOIN
            users u ON bf.user_id = u.idx
            LEFT JOIN 
            reply r ON bf.idx = r.bo_id
            GROUP BY 
            bf.idx
            ORDER BY 
            bf.idx DESC 
            LIMIT ${startNum}, 10`
        const [loadBoard] = await sql_con.promise().query(loadBoardList);
        console.log(loadBoard);
        board_list = loadBoard

        console.log('여기 아니야?!?!?!');

    } catch (error) {

    }
    return res.json({ board_list })
})


boardRouter.post('/upload', async (req, res, next) => {
    const { user_id, subject, content, imgs } = req.body
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(now);

    console.log(subject);
    console.log(content);
    console.log(imgs);

    try {
        const boardUploadQuery = "INSERT INTO board_fee (user_id, imgs, subject, content, created_at) VALUES (?,?,?,?,?)"
        await sql_con.promise().query(boardUploadQuery, [user_id, imgs, subject, content, now]);
    } catch (error) {
        return res.status(400).json({ message: '업로드 실패!' })
    }

    return res.json({})
})

export { boardRouter }