import express from 'express';

export type SessionRequest = express.Request & {
    session?: Express.Session;
    sessionID?: string;
};
