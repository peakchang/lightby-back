import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const admUsersRouter = express.Router();


admUsersRouter.post('/delete_user', async (req, res, next) => {
    const { userId } = req.body

    console.log(userId);
    
    try {
        const deleteUserQuery = "DELETE FROM users WHERE idx = ?";
        await sql_con.promise().query(deleteUserQuery, [userId]);
    } catch (error) {

    }

    res.status(200).json({})
})

admUsersRouter.post('/get_users', async (req, res, next) => {


    let userList = []

    const nowPage = req.body.nowPage || 1;
    const searchVal = req.body.searchVal || "";
    const searchType = req.body.searchType || "";

    let allCount = 0;
    let maxPage = 0;
    let onePageCount = 15;

    const startNum = (nowPage - 1) * onePageCount;

    let searchStr = ""
    if (searchVal && searchType) {
        searchStr = ` ${searchType} LIKE "%${searchVal}%"`;
    }

    try {
        const getUserCountQuery = `SELECT COUNT(*) AS allcount FROM users WHERE rate < 4 ${searchStr ? `AND ${searchStr}` : ""}`;
        const [getUserCount] = await sql_con.promise().query(getUserCountQuery);
        allCount = getUserCount[0]['allcount']

        maxPage = Math.ceil(allCount / onePageCount);

        const getUsersQuery = `SELECT * FROM users ${searchStr ? `WHERE ${searchStr}` : ""} ORDER BY idx DESC LIMIT ${startNum}, ${onePageCount}`
        const [getUsers] = await sql_con.promise().query(getUsersQuery);
        userList = getUsers
    } catch (err) {
        console.error(err.message);
    }
    res.json({ userList, allCount, maxPage })
})

export { admUsersRouter }