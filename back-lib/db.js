import mysql, { } from "mysql2"
import dotenv from "dotenv"
dotenv.config();


export const sql_con = mysql.createConnection({
    host: process.env.HOST || '127.0.0.1',
    user: 'root',
    password: process.env.DBPWD,
    database: process.env.SHEMA,
    charset: 'utf8mb4'
})

// CREATE DATABASE findsales default CHARACTER SET UTF8;

/*

CREATE DATABASE richby default CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE DATABASE ezip default CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS base(
    base VARCHAR(10),
    status_list VARCHAR(255) NOT NULL,
    color_list VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS land(
    ld_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ld_name VARCHAR(255),
    ld_content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    ld_location VARCHAR(100) NOT NULL,
    ld_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE land ADD COLUMN ld_location VARCHAR(100) NOT NULL;

CREATE TABLE IF NOT EXISTS cu_info(
    cu_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cu_name VARCHAR(100),
    cu_phone VARCHAR(100),
    cu_land INT,
    cu_status VARCHAR(100),
    cu_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cu_land) REFERENCES land(ld_id) ON DELETE SET NULL
);

ALTER TABLE cu_info ADD COLUMN cu_status VARCHAR(100) AFTER cu_land;

CREATE TABLE IF NOT EXISTS client(
    cl_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cl_name VARCHAR(100),
    cl_phone VARCHAR(100),
    cl_status VARCHAR(50),
    cl_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE client ADD COLUMN cl_status VARCHAR(50) AFTER cl_phone;

*/