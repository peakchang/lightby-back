import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'

const apiRouter = express.Router();



export { apiRouter }