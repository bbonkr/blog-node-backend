import express = require('express');

export interface IControllerBase {
    getPath(): string;
    getRouter(): express.Router;
}
