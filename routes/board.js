import express from "express";
import { sql_con } from "../back-lib/db.js";
import moment from "moment-timezone";


const boardRouter = express.Router();

boardRouter.post('/chk_like', async (req, res, next) => {

    const { user_id, post_id } = req.body;
    let likeStatus = false;
    try {
        const chkLikeQuery = "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?";
        const [chkLike] = await sql_con.promise().query(chkLikeQuery, [user_id, post_id]);
        if (chkLike.length == 0) {
            likeStatus = false;
        } else {
            if (chkLike[0]['is_liked']) {
                likeStatus = true;
            }
        }
    } catch (error) {

    }
    res.json({ likeStatus })
})

boardRouter.post('/like_action', async (req, res, next) => {

    const { user_id, post_id } = req.body;
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    let likeStatus = false;

    try {
        const chkLikeQuery = "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?";
        const [chkLike] = await sql_con.promise().query(chkLikeQuery, [user_id, post_id]);

        if (chkLike.length > 0 && chkLike[0]['is_liked'] == true) {
            const updateLikeDelQuery = "UPDATE post_likes SET is_liked = FALSE WHERE user_id = ? AND post_id = ?"
            await sql_con.promise().query(updateLikeDelQuery, [user_id, post_id]);

            likeStatus = false;
        } else if (chkLike.length > 0 && chkLike[0]['is_liked'] == false) {
            const updateLikeDelQuery = "UPDATE post_likes SET is_liked = TRUE WHERE user_id = ? AND post_id = ?"
            await sql_con.promise().query(updateLikeDelQuery, [user_id, post_id]);

            likeStatus = true;
        } else {
            const insertListQuery = "INSERT INTO post_likes (user_id, post_id, created_at) VALUES (?,?,?)";
            await sql_con.promise().query(insertListQuery, [user_id, post_id, now]);

            likeStatus = true;
        }

    } catch (error) {
        console.error(error.message);

    }
    res.json({ likeStatus })
})

boardRouter.post('/upload_reply', async (req, res, next) => {
    const { bo_id, user_id, replyContent } = req.body
    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    try {
        const replyInsertQuery = "INSERT INTO reply (user_id, bo_id, content, created_at) VALUES (?,?,?,?)";
        await sql_con.promise().query(replyInsertQuery, [user_id, bo_id, replyContent, now]);
    } catch (error) {

    }



    res.json({})
})

boardRouter.post('/load_item', async (req, res, next) => {
    let postItem = {};
    let replyList = [];
    let likeCount = 0
    let { postIdx } = req.body


    try {
        // 기본 post 내용 불러오기 (user 정보랑 JOIN 해서 불러오기)
        const getpostItemQuery = `SELECT bf.*, u.nickname, u.profile_thumbnail
        FROM
        board_fee bf
        LEFT JOIN
        users u ON bf.user_id = u.idx
        WHERE
        bf.idx = ?`
        const [getpostItem] = await sql_con.promise().query(getpostItemQuery, [postIdx.id]);
        postItem = getpostItem[0]

        const getLikeCountQuery = "SELECT COUNT(*) as likeCount FROM post_likes WHERE post_id = ? AND is_liked = TRUE";
        const [getLikeCount] = await sql_con.promise().query(getLikeCountQuery, [postIdx.id]);
        likeCount = getLikeCount[0]['likeCount']


        const getReplyListQuery = `SELECT r.*, u.nickname, u.profile_thumbnail 
        FROM reply r
        LEFT JOIN
        users u ON r.user_id = u.idx
        WHERE bo_id = ?
        ORDER BY idx DESC
        `;
        const [getReplyList] = await sql_con.promise().query(getReplyListQuery, [postItem.idx]);
        replyList = getReplyList

        console.log(replyList);
        

    } catch (error) {
        console.error(error.message);
    }
    return res.json({ postItem, replyList, likeCount })
})


boardRouter.post('/load_list', async (req, res, next) => {

    let { startNum } = req.body

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
        board_list = loadBoard

    } catch (error) {

    }
    return res.json({ board_list })
})


boardRouter.post('/upload', async (req, res, next) => {
    const { user_id, subject, content, imgs } = req.body
    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    try {
        const boardUploadQuery = "INSERT INTO board_fee (user_id, imgs, subject, content, created_at) VALUES (?,?,?,?,?)"
        await sql_con.promise().query(boardUploadQuery, [user_id, imgs, subject, content, now]);
    } catch (error) {
        return res.status(400).json({ message: '업로드 실패!' })
    }

    return res.json({})
})

export { boardRouter }