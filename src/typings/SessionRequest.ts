import express = require('express');

export type SessionRequest = express.Request & {
    session?: Express.Session;
    sessionID?: string;
};
