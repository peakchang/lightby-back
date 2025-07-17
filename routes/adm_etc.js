import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const admEtcRouter = express.Router();

admEtcRouter.post('/get_users', async (req, res, next) => {
    console.log('진입 하지?');

    const { page } = req.body;
    res.json({})
})



export { admEtcRouter }