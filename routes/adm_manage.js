import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const admManageRouter = express.Router();

admManageRouter.post('/', async (req, res, next) => {
})



export { admManageRouter }