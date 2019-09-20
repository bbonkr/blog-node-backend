import express from 'express';
import multer from 'multer';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

export const uploadToDiskStorage = multer({
    storage: multer.diskStorage({
        destination: (
            req: express.Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
        ): void => {
            // 파일 저장 경로
            const uploadDir: string = path.join(process.cwd(), 'uploads');
            const mm = moment(Date.now()).format('MM');
            const yyyy = moment(Date.now()).format('YYYY');
            const dest = path.join(uploadDir, `${req.user.id}`, yyyy, mm);

            // synchronous
            const existsDir = fs.existsSync(dest);
            if (!existsDir) {
                fs.mkdirSync(dest, { recursive: true });
            }

            callback(null, dest);
        },
        filename(
            req: Express.Request,
            file: Express.Multer.File,
            callback: (error: Error | null, filename: string) => void,
        ): void {
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);

            // 저장되는 파일이름
            callback(null, `${basename}${new Date().valueOf()}${ext}`);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
});
