import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const admUsersRouter = express.Router();


admUsersRouter.post('/get_users', async (req, res, next) => {
    const { page } = req.body;
    const pageCount = 30
    const startNum = (page - 1) * pageCount

    let userList = []
    let allCount = 0
    try {

        const getUserCountQuery = "SELECT COUNT(*) AS allcount FROM users WHERE rate < 5";
        const [getUserCount] = await sql_con.promise().query(getUserCountQuery);
        allCount = getUserCount[0]['allcount']


        const getUsersQuery = `SELECT * FROM users ORDER BY idx DESC LIMIT ${startNum}, ${pageCount}`
        const [getUsers] = await sql_con.promise().query(getUsersQuery);
        userList = getUsers
    } catch (error) {

    }
    res.json({ userList, allCount })
})

export { admUsersRouter }