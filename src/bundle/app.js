/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app.ts":
/*!****************!*\
  !*** ./app.ts ***!
  \****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const cookie_parser_1 = __importDefault(__webpack_require__(/*! cookie-parser */ "cookie-parser"));
const express_session_1 = __importDefault(__webpack_require__(/*! express-session */ "express-session"));
const morgan_1 = __importDefault(__webpack_require__(/*! morgan */ "morgan"));
const cors_1 = __importDefault(__webpack_require__(/*! cors */ "cors"));
const models_1 = __webpack_require__(/*! ./models */ "./models/index.ts");
const passport = __webpack_require__(/*! passport */ "passport");
const databaseSessionStore_1 = __importDefault(__webpack_require__(/*! ./passport/databaseSessionStore */ "./passport/databaseSessionStore.ts"));
const errorProcess_1 = __webpack_require__(/*! ./middleware/errorProcess */ "./middleware/errorProcess.ts");
const PassportInitializer_1 = __webpack_require__(/*! ./passport/PassportInitializer */ "./passport/PassportInitializer.ts");
class App {
    constructor(controllers, port) {
        this.cookieName = process.env.COOKIE_NAME;
        this.app = express_1.default();
        this.port = port || 3000;
        this.initializeDatabaseConnection();
        this.initializePassport();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`[APP] App is running on the port ${this.port}`);
        });
    }
    initializeDatabaseConnection() {
        models_1.sequelize
            .sync({
            force: false,
            alter: false,
        })
            .then((_) => {
            console.log('[APP] Database ready!');
        });
    }
    initializePassport() {
        const passportInitializer = new PassportInitializer_1.PassportInitializer();
        passportInitializer.init();
    }
    initializeMiddlewares() {
        const dbSessionStore = new databaseSessionStore_1.default({
            expiration: 1000 * 60 * 60 * 24 * 90,
        });
        this.app.use(morgan_1.default('dev'));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use('/', express_1.default.static('uploads'));
        this.app.use(cors_1.default({
            origin: 'http://localhost:3000',
            credentials: true,
        }));
        this.app.use(cookie_parser_1.default(process.env.COOKIE_SECRET));
        this.app.use(express_session_1.default({
            name: this.cookieName,
            resave: false,
            saveUninitialized: false,
            secret: process.env.COOKIE_SECRET,
            cookie: {
                httpOnly: true,
                secure: false,
            },
            store: dbSessionStore,
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }
    initializeControllers(controllers) {
        controllers.forEach((controller, index) => {
            this.app.use(controller.getPath(), controller.getRouter());
        });
        this.app.get('*', (req, res, next) => {
            res.status(404).send({ message: `Not fount: ${req.url}` });
        });
        this.app.use(errorProcess_1.errorLogger);
        this.app.use(errorProcess_1.errorJsonResult);
    }
}
exports.App = App;


/***/ }),

/***/ "./config/config.ts":
/*!**************************!*\
  !*** ./config/config.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(__webpack_require__(/*! dotenv */ "dotenv"));
dotenv_1.default.config();
exports.sequelizeConfig = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mariadb',
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mariadb',
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mariadb',
    },
};


/***/ }),

/***/ "./config/jwtOptions.ts":
/*!******************************!*\
  !*** ./config/jwtOptions.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtOptions = {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    secret: process.env.JWT_SECRET,
};


/***/ }),

/***/ "./controllers/Posts.controller.ts":
/*!*****************************************!*\
  !*** ./controllers/Posts.controller.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ControllerBase_1 = __webpack_require__(/*! ../typings/ControllerBase */ "./typings/ControllerBase.ts");
const sequelize_1 = __importDefault(__webpack_require__(/*! sequelize */ "sequelize"));
const User_model_1 = __webpack_require__(/*! ../models/User.model */ "./models/User.model.ts");
const defaultUserAttributes_1 = __webpack_require__(/*! ../typings/defaultUserAttributes */ "./typings/defaultUserAttributes.ts");
const Post_model_1 = __webpack_require__(/*! ../models/Post.model */ "./models/Post.model.ts");
const Tag_model_1 = __webpack_require__(/*! ../models/Tag.model */ "./models/Tag.model.ts");
const Category_model_1 = __webpack_require__(/*! ../models/Category.model */ "./models/Category.model.ts");
const PostAccessLog_model_1 = __webpack_require__(/*! ../models/PostAccessLog.model */ "./models/PostAccessLog.model.ts");
const JsonResult_1 = __webpack_require__(/*! ../typings/JsonResult */ "./typings/JsonResult.ts");
const Op = sequelize_1.default.Op;
class PostsController extends ControllerBase_1.ControllerBase {
    getPath() {
        return '/api/posts';
    }
    initializeRoutes() {
        this.router.get('/', this.getPosts);
    }
    async getPosts(req, res, next) {
        try {
            const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 10;
            const keyword = req.query.keyword && decodeURIComponent(req.query.keyword);
            const pageToken = (req.query.pageToken && parseInt(req.query.pageToken, 10)) || 0;
            const skip = pageToken ? 1 : 0;
            let where = {};
            if (keyword) {
                Object.assign(where, {
                    [Op.or]: [
                        { title: { [Op.like]: `%${keyword}%` } },
                        {
                            text: {
                                [Op.like]: `%${keyword}%`,
                            },
                        },
                    ],
                });
            }
            const { count } = await Post_model_1.Post.findAndCountAll({
                where: where,
                attributes: ['id'],
            });
            if (pageToken) {
                const basisPost = await Post_model_1.Post.findOne({
                    where: {
                        id: pageToken,
                    },
                });
                if (basisPost) {
                    where = {
                        createdAt: {
                            [Op.lt]: basisPost.createdAt,
                        },
                    };
                }
            }
            const posts = await Post_model_1.Post.findAll({
                where: where,
                include: [
                    {
                        model: User_model_1.User,
                        as: 'user',
                        attributes: defaultUserAttributes_1.defaultUserAttributes,
                    },
                    {
                        model: Tag_model_1.Tag,
                        attributes: ['id', 'slug', 'name'],
                    },
                    {
                        model: Category_model_1.Category,
                        attributes: ['id', 'slug', 'name', 'ordinal'],
                    },
                    {
                        model: PostAccessLog_model_1.PostAccessLog,
                        attributes: ['id'],
                    },
                    {
                        model: User_model_1.User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: skip,
                attributes: [
                    'id',
                    'title',
                    'slug',
                    'excerpt',
                    'coverImage',
                    'createdAt',
                    'updatedAt',
                ],
            });
            return res.json(new JsonResult_1.JsonResult({
                success: true,
                data: {
                    records: posts,
                    total: count,
                },
            }));
        }
        catch (err) {
            return next(err);
        }
    }
}
exports.PostsController = PostsController;


/***/ }),

/***/ "./index.ts":
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(__webpack_require__(/*! dotenv */ "dotenv"));
const app_1 = __webpack_require__(/*! ./app */ "./app.ts");
const Posts_controller_1 = __webpack_require__(/*! ./controllers/Posts.controller */ "./controllers/Posts.controller.ts");
dotenv_1.default.config();
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || 'localhost';
const protocol = process.env.PROTOCOL || 'http';
const dev = "development" !== 'production';
const prod = "development" === 'production';
const app = new app_1.App([
    new Posts_controller_1.PostsController(),
], port);
app.listen();


/***/ }),

/***/ "./middleware/errorProcess.ts":
/*!************************************!*\
  !*** ./middleware/errorProcess.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusError_1 = __webpack_require__(/*! ../typings/HttpStatusError */ "./typings/HttpStatusError.ts");
const JsonResult_1 = __webpack_require__(/*! ../typings/JsonResult */ "./typings/JsonResult.ts");
const isProd = "development" === 'production';
exports.errorLogger = (err, req, res, next) => {
    console.error(err);
    return next(err);
};
exports.errorJsonResult = (err, req, res, next) => {
    let error;
    if (err instanceof HttpStatusError_1.HttpStatusError) {
        error = err;
    }
    else {
        error = new HttpStatusError_1.HttpStatusError({
            code: 500,
            message: err.message,
            inner: isProd ? null : err,
        });
    }
    return res.status(error.code).json(JsonResult_1.JsonResult.getErrorResult(error));
};


/***/ }),

/***/ "./models/Category.model.ts":
/*!**********************************!*\
  !*** ./models/Category.model.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const PostCategory_model_1 = __webpack_require__(/*! ./PostCategory.model */ "./models/PostCategory.model.ts");
let Category = class Category extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Comment('이름'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Comment('슬러그'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], Category.prototype, "slug", void 0);
__decorate([
    sequelize_typescript_1.Comment('출력순서'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(1),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Category.prototype, "ordinal", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => User_model_1.User),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Category.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => User_model_1.User),
    __metadata("design:type", User_model_1.User)
], Category.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => Post_model_1.Post, () => PostCategory_model_1.PostCategory),
    __metadata("design:type", Array)
], Category.prototype, "posts", void 0);
Category = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'Category',
        tableName: 'Categories',
        comment: '분류',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], Category);
exports.Category = Category;


/***/ }),

/***/ "./models/Comment.model.ts":
/*!*********************************!*\
  !*** ./models/Comment.model.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
let Comment = class Comment extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Comment('마크다운'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Comment.prototype, "markdown", void 0);
__decorate([
    sequelize_typescript_1.Comment('html'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Comment.prototype, "html", void 0);
__decorate([
    sequelize_typescript_1.Comment('텍스트'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Comment.prototype, "text", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => User_model_1.User),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Comment.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => User_model_1.User),
    __metadata("design:type", User_model_1.User)
], Comment.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => Post_model_1.Post),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Comment.prototype, "postId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Post_model_1.Post),
    __metadata("design:type", Post_model_1.Post)
], Comment.prototype, "post", void 0);
Comment = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'Comment',
        tableName: 'Comments',
        comment: '댓글',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], Comment);
exports.Comment = Comment;


/***/ }),

/***/ "./models/Image.model.ts":
/*!*******************************!*\
  !*** ./models/Image.model.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
const PostImage_model_1 = __webpack_require__(/*! ./PostImage.model */ "./models/PostImage.model.ts");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
let Image = class Image extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Comment('접근 경로'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], Image.prototype, "src", void 0);
__decorate([
    sequelize_typescript_1.Comment('서버 경로'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], Image.prototype, "path", void 0);
__decorate([
    sequelize_typescript_1.Comment('파일 이름'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(300)),
    __metadata("design:type", String)
], Image.prototype, "fileName", void 0);
__decorate([
    sequelize_typescript_1.Comment('확장자'),
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(20)),
    __metadata("design:type", String)
], Image.prototype, "fileExtension", void 0);
__decorate([
    sequelize_typescript_1.Comment('크기'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], Image.prototype, "size", void 0);
__decorate([
    sequelize_typescript_1.Comment('컨테트 형식'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default('application/octet-stream'),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], Image.prototype, "contentType", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => User_model_1.User),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Image.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => User_model_1.User),
    __metadata("design:type", User_model_1.User)
], Image.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => Post_model_1.Post, () => PostImage_model_1.PostImage),
    __metadata("design:type", Array)
], Image.prototype, "posts", void 0);
Image = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'Image',
        tableName: 'Images',
        comment: '첨부파일',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], Image);
exports.Image = Image;


/***/ }),

/***/ "./models/Post.model.ts":
/*!******************************!*\
  !*** ./models/Post.model.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Category_model_1 = __webpack_require__(/*! ./Category.model */ "./models/Category.model.ts");
const PostCategory_model_1 = __webpack_require__(/*! ./PostCategory.model */ "./models/PostCategory.model.ts");
const Comment_model_1 = __webpack_require__(/*! ./Comment.model */ "./models/Comment.model.ts");
const Image_model_1 = __webpack_require__(/*! ./Image.model */ "./models/Image.model.ts");
const PostImage_model_1 = __webpack_require__(/*! ./PostImage.model */ "./models/PostImage.model.ts");
const Tag_model_1 = __webpack_require__(/*! ./Tag.model */ "./models/Tag.model.ts");
const PostTag_model_1 = __webpack_require__(/*! ./PostTag.model */ "./models/PostTag.model.ts");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
const UserLikePost_model_1 = __webpack_require__(/*! ./UserLikePost.model */ "./models/UserLikePost.model.ts");
const PostAccessLog_model_1 = __webpack_require__(/*! ./PostAccessLog.model */ "./models/PostAccessLog.model.ts");
let Post = class Post extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(200)),
    __metadata("design:type", String)
], Post.prototype, "slug", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Post.prototype, "markdown", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Post.prototype, "html", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Post.prototype, "text", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Post.prototype, "excerpt", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], Post.prototype, "coverImage", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Post.prototype, "isPublished", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", String)
], Post.prototype, "isPrivate", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], Post.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Post.prototype, "isPinned", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Post.prototype, "isDeleted", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Post.prototype, "deletedAt", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => User_model_1.User),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Post.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => User_model_1.User, { as: 'user', foreignKey: 'userId' }),
    __metadata("design:type", User_model_1.User)
], Post.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => Category_model_1.Category, () => PostCategory_model_1.PostCategory),
    __metadata("design:type", Array)
], Post.prototype, "categories", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Comment_model_1.Comment),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => PostAccessLog_model_1.PostAccessLog),
    __metadata("design:type", Array)
], Post.prototype, "accessLogs", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => Image_model_1.Image, () => PostImage_model_1.PostImage),
    __metadata("design:type", Array)
], Post.prototype, "images", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => Tag_model_1.Tag, () => PostTag_model_1.PostTag),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => User_model_1.User, { through: () => UserLikePost_model_1.UserLikePost, as: 'likers' }),
    __metadata("design:type", Array)
], Post.prototype, "likers", void 0);
Post = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'Post',
        tableName: 'Posts',
        comment: '글',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], Post);
exports.Post = Post;


/***/ }),

/***/ "./models/PostAccessLog.model.ts":
/*!***************************************!*\
  !*** ./models/PostAccessLog.model.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
let PostAccessLog = class PostAccessLog extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], PostAccessLog.prototype, "ipAddress", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], PostAccessLog.prototype, "userAgent", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostAccessLog.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => Post_model_1.Post),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostAccessLog.prototype, "postId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Post_model_1.Post),
    __metadata("design:type", Post_model_1.Post)
], PostAccessLog.prototype, "post", void 0);
PostAccessLog = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'PostAccessLog',
        tableName: 'PostAccessLogs',
        comment: '글 접근 로그',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], PostAccessLog);
exports.PostAccessLog = PostAccessLog;


/***/ }),

/***/ "./models/PostCategory.model.ts":
/*!**************************************!*\
  !*** ./models/PostCategory.model.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const Category_model_1 = __webpack_require__(/*! ./Category.model */ "./models/Category.model.ts");
let PostCategory = class PostCategory extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => Post_model_1.Post),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostCategory.prototype, "postId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => Category_model_1.Category),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostCategory.prototype, "categoryId", void 0);
PostCategory = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'PostCategory',
        tableName: 'PostCategory',
        comment: '글-분류',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], PostCategory);
exports.PostCategory = PostCategory;


/***/ }),

/***/ "./models/PostImage.model.ts":
/*!***********************************!*\
  !*** ./models/PostImage.model.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const Image_model_1 = __webpack_require__(/*! ./Image.model */ "./models/Image.model.ts");
let PostImage = class PostImage extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => Post_model_1.Post),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostImage.prototype, "postId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => Image_model_1.Image),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostImage.prototype, "imageId", void 0);
PostImage = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'PostImage',
        tableName: 'PostImage',
        comment: '첨부파일',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], PostImage);
exports.PostImage = PostImage;


/***/ }),

/***/ "./models/PostTag.model.ts":
/*!*********************************!*\
  !*** ./models/PostTag.model.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const Tag_model_1 = __webpack_require__(/*! ./Tag.model */ "./models/Tag.model.ts");
let PostTag = class PostTag extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => Post_model_1.Post),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostTag.prototype, "postId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => Tag_model_1.Tag),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], PostTag.prototype, "tagId", void 0);
PostTag = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'PostTag',
        tableName: 'PostTag',
        comment: '글-태그',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], PostTag);
exports.PostTag = PostTag;


/***/ }),

/***/ "./models/ResetPasswordCode.model.ts":
/*!*******************************************!*\
  !*** ./models/ResetPasswordCode.model.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
let ResetPasswordCode = class ResetPasswordCode extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(200)),
    __metadata("design:type", String)
], ResetPasswordCode.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], ResetPasswordCode.prototype, "code", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], ResetPasswordCode.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], ResetPasswordCode.prototype, "expired", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => User_model_1.User),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ResetPasswordCode.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => User_model_1.User),
    __metadata("design:type", User_model_1.User)
], ResetPasswordCode.prototype, "user", void 0);
ResetPasswordCode = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'ResetPasswordCode',
        tableName: 'ResetPasswordCodes',
        comment: '비밀번호 변경 요청 코드',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], ResetPasswordCode);
exports.ResetPasswordCode = ResetPasswordCode;


/***/ }),

/***/ "./models/Tag.model.ts":
/*!*****************************!*\
  !*** ./models/Tag.model.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const PostTag_model_1 = __webpack_require__(/*! ./PostTag.model */ "./models/PostTag.model.ts");
let Tag = class Tag extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], Tag.prototype, "slug", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => Post_model_1.Post, () => PostTag_model_1.PostTag),
    __metadata("design:type", Array)
], Tag.prototype, "posts", void 0);
Tag = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'Tag',
        tableName: 'Tags',
        comment: '태그',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], Tag);
exports.Tag = Tag;


/***/ }),

/***/ "./models/User.model.ts":
/*!******************************!*\
  !*** ./models/User.model.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Category_model_1 = __webpack_require__(/*! ./Category.model */ "./models/Category.model.ts");
const Comment_model_1 = __webpack_require__(/*! ./Comment.model */ "./models/Comment.model.ts");
const Image_model_1 = __webpack_require__(/*! ./Image.model */ "./models/Image.model.ts");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const UserLikePost_model_1 = __webpack_require__(/*! ./UserLikePost.model */ "./models/UserLikePost.model.ts");
const UserVerifyCode_model_1 = __webpack_require__(/*! ./UserVerifyCode.model */ "./models/UserVerifyCode.model.ts");
const ResetPasswordCode_model_1 = __webpack_require__(/*! ./ResetPasswordCode.model */ "./models/ResetPasswordCode.model.ts");
let User = class User extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(200)),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailConfirmed", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], User.prototype, "photo", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Category_model_1.Category),
    __metadata("design:type", Array)
], User.prototype, "categories", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Comment_model_1.Comment),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Image_model_1.Image),
    __metadata("design:type", Array)
], User.prototype, "images", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Post_model_1.Post),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => Post_model_1.Post, () => UserLikePost_model_1.UserLikePost),
    __metadata("design:type", Array)
], User.prototype, "likedPosts", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => UserVerifyCode_model_1.UserVerifyCode),
    __metadata("design:type", Array)
], User.prototype, "verifyCodes", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => ResetPasswordCode_model_1.ResetPasswordCode),
    __metadata("design:type", Array)
], User.prototype, "resetPasswordCodes", void 0);
User = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'User',
        tableName: 'Users',
        comment: '사용자',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], User);
exports.User = User;


/***/ }),

/***/ "./models/UserLikePost.model.ts":
/*!**************************************!*\
  !*** ./models/UserLikePost.model.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
let UserLikePost = class UserLikePost extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => Post_model_1.Post),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], UserLikePost.prototype, "postId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.ForeignKey(() => User_model_1.User),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], UserLikePost.prototype, "userId", void 0);
UserLikePost = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'UserLikePost',
        tableName: 'UserLikePost',
        comment: '글-좋아요',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], UserLikePost);
exports.UserLikePost = UserLikePost;


/***/ }),

/***/ "./models/UserVerifyCode.model.ts":
/*!****************************************!*\
  !*** ./models/UserVerifyCode.model.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
let UserVerifyCode = class UserVerifyCode extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(200)),
    __metadata("design:type", String)
], UserVerifyCode.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], UserVerifyCode.prototype, "code", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], UserVerifyCode.prototype, "expire", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.ForeignKey(() => User_model_1.User),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], UserVerifyCode.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => User_model_1.User),
    __metadata("design:type", User_model_1.User)
], UserVerifyCode.prototype, "user", void 0);
UserVerifyCode = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'UserVerifyCode',
        tableName: 'UserVerifyCodes',
        comment: '전자우편 확인 코드',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], UserVerifyCode);
exports.UserVerifyCode = UserVerifyCode;


/***/ }),

/***/ "./models/index.ts":
/*!*************************!*\
  !*** ./models/index.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
const config_1 = __webpack_require__(/*! ../config/config */ "./config/config.ts");
const User_model_1 = __webpack_require__(/*! ./User.model */ "./models/User.model.ts");
const Category_model_1 = __webpack_require__(/*! ./Category.model */ "./models/Category.model.ts");
const Post_model_1 = __webpack_require__(/*! ./Post.model */ "./models/Post.model.ts");
const Comment_model_1 = __webpack_require__(/*! ./Comment.model */ "./models/Comment.model.ts");
const Image_model_1 = __webpack_require__(/*! ./Image.model */ "./models/Image.model.ts");
const PostAccessLog_model_1 = __webpack_require__(/*! ./PostAccessLog.model */ "./models/PostAccessLog.model.ts");
const PostCategory_model_1 = __webpack_require__(/*! ./PostCategory.model */ "./models/PostCategory.model.ts");
const PostImage_model_1 = __webpack_require__(/*! ./PostImage.model */ "./models/PostImage.model.ts");
const PostTag_model_1 = __webpack_require__(/*! ./PostTag.model */ "./models/PostTag.model.ts");
const Tag_model_1 = __webpack_require__(/*! ./Tag.model */ "./models/Tag.model.ts");
const ResetPasswordCode_model_1 = __webpack_require__(/*! ./ResetPasswordCode.model */ "./models/ResetPasswordCode.model.ts");
const UserLikePost_model_1 = __webpack_require__(/*! ./UserLikePost.model */ "./models/UserLikePost.model.ts");
const UserVerifyCode_model_1 = __webpack_require__(/*! ./UserVerifyCode.model */ "./models/UserVerifyCode.model.ts");
const Session_model_1 = __webpack_require__(/*! ../passport/Session.model */ "./passport/Session.model.ts");
const env = "development" || false;
const config = config_1.sequelizeConfig[env];
const sequelizeOptions = {
    ...config,
    models: [
        Session_model_1.Session,
        User_model_1.User,
        Category_model_1.Category,
        Post_model_1.Post,
        Comment_model_1.Comment,
        Image_model_1.Image,
        Tag_model_1.Tag,
        PostAccessLog_model_1.PostAccessLog,
        PostCategory_model_1.PostCategory,
        PostImage_model_1.PostImage,
        PostTag_model_1.PostTag,
        ResetPasswordCode_model_1.ResetPasswordCode,
        UserLikePost_model_1.UserLikePost,
        UserVerifyCode_model_1.UserVerifyCode,
    ],
};
exports.sequelize = new sequelize_typescript_1.Sequelize(sequelizeOptions);


/***/ }),

/***/ "./passport/PassportInitializer.ts":
/*!*****************************************!*\
  !*** ./passport/PassportInitializer.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(__webpack_require__(/*! passport */ "passport"));
const User_model_1 = __webpack_require__(/*! ../models/User.model */ "./models/User.model.ts");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const jwtOptions_1 = __webpack_require__(/*! ../config/jwtOptions */ "./config/jwtOptions.ts");
const passport_local_1 = __webpack_require__(/*! passport-local */ "passport-local");
const bcrypt_1 = __importDefault(__webpack_require__(/*! bcrypt */ "bcrypt"));
class PassportInitializer {
    init() {
        this.initializePassprt();
        this.initializeLocal();
        this.initializeJwt();
    }
    initializePassprt() {
        passport_1.default.serializeUser((user, done) => {
            console.debug('passport.serializeUser');
            return done(null, user.id);
        });
        passport_1.default.deserializeUser(async (id, done) => {
            console.debug('>>>> passport.deserializeUser');
            try {
                const user = await User_model_1.User.findOne({
                    where: {
                        id: id,
                    },
                    attributes: [
                        'id',
                        'username',
                        'displayName',
                        'email',
                        'photo',
                    ],
                });
                return done(null, user);
            }
            catch (e) {
                console.error(e);
                return done(e, null);
            }
        });
    }
    initializeLocal() {
        passport_1.default.use(new passport_local_1.Strategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
            session: false,
        }, async (req, username, password, done) => {
            try {
                const user = await User_model_1.User.findOne({
                    where: { username: username },
                });
                if (!user) {
                    return done(null, null, {
                        message: 'Please check your account information and try again. Not exists email in our system.',
                    });
                }
                const result = await bcrypt_1.default.compare(password, user.password);
                if (result) {
                    const transferUser = await User_model_1.User.findOne({
                        where: { id: user.id },
                        attributes: [
                            'id',
                            'username',
                            'displayName',
                            'email',
                            'photo',
                        ],
                    });
                    return done(null, transferUser);
                }
                else {
                    return done(null, null, {
                        message: 'Please check your account info and try again.',
                    });
                }
            }
            catch (e) {
                console.error(e);
                return done(e);
            }
        }));
    }
    initializeJwt() {
        const options = {
            ...jwtOptions_1.jwtOptions,
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtOptions_1.jwtOptions.secret,
            passReqToCallback: true,
        };
        const strategy = new passport_jwt_1.Strategy(options, async (req, payload, done) => {
            try {
                const { username } = payload;
                User_model_1.User.findOne({
                    where: {
                        username: username,
                    },
                    attributes: ['id', 'username', 'email', 'displayName'],
                })
                    .then((user) => {
                    if (!user) {
                        throw new Error('could not find a account information.');
                    }
                    req.user = {
                        id: user.id,
                        username: user.username,
                    };
                    req.userInfo = user;
                    done(null, user, null);
                })
                    .catch((err) => {
                    done(err, null, {
                        message: err.message,
                    });
                });
            }
            catch (e) {
                console.error(e);
                done(e, null, {
                    message: e,
                });
            }
        });
        passport_1.default.use(strategy);
    }
}
exports.PassportInitializer = PassportInitializer;


/***/ }),

/***/ "./passport/Session.model.ts":
/*!***********************************!*\
  !*** ./passport/Session.model.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = __webpack_require__(/*! sequelize-typescript */ "sequelize-typescript");
let Session = class Session extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(1000)),
    __metadata("design:type", String)
], Session.prototype, "sid", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Session.prototype, "sess", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Session.prototype, "expire", void 0);
Session = __decorate([
    sequelize_typescript_1.Table({
        modelName: 'Session',
        tableName: 'Sessions',
        timestamps: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    })
], Session);
exports.Session = Session;


/***/ }),

/***/ "./passport/databaseSessionStore.ts":
/*!******************************************!*\
  !*** ./passport/databaseSessionStore.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(__webpack_require__(/*! express-session */ "express-session"));
const sequelize_1 = __importDefault(__webpack_require__(/*! sequelize */ "sequelize"));
const Session_model_1 = __webpack_require__(/*! ./Session.model */ "./passport/Session.model.ts");
const Op = sequelize_1.default.Op;
class DatabaseSessionStore extends express_session_1.default.Store {
    constructor(config) {
        super(config);
        this.destroy = (sid, callback) => {
            Session_model_1.Session.findOne({
                where: {
                    sid: sid,
                },
            })
                .then((session) => session.destroy())
                .catch((err) => {
                console.error(err);
                if (callback) {
                    callback(err);
                }
            });
        };
        this.get = (sid, callback) => {
            Session_model_1.Session.findOne({ where: { sid: sid } })
                .then((session) => {
                const now = new Date();
                const expired = session.expire > now;
                const err = expired
                    ? new Error('Session was expired.')
                    : null;
                const sessionData = expired
                    ? null
                    : JSON.parse(session.sess);
                console.debug('session: ', expired ? 'expired' : 'valid');
                if (callback) {
                    callback(err, sessionData);
                }
            })
                .catch((err) => {
                console.error(err);
                if (callback) {
                    callback(err, null);
                }
            });
        };
        this.set = (sid, session, callback) => {
            const now = new Date();
            const expireMiliseconds = now.setMilliseconds(now.getMilliseconds() + this.options.expiration);
            const expire = new Date(expireMiliseconds);
            const newSession = new Session_model_1.Session({
                sid: sid,
                sess: JSON.stringify(session),
                expire: expire,
            });
            newSession
                .save()
                .then((_) => {
                console.debug('session created.');
                if (callback) {
                    callback(null);
                }
            })
                .catch((err) => {
                console.error(err);
                if (callback) {
                    callback(err);
                }
            });
        };
        const options = {
            expiration: config.expiration || 1000 * 60 * 60 * 24 * 120,
            clearInterval: config.clearInterval || 1000 * 60 * 30,
        };
        this.options = options;
        this.startClearExpiredSessions();
    }
    clearExpiredSessions() {
        Session_model_1.Session.destroy({
            where: {
                expire: {
                    [Op.lte]: new Date(),
                },
            },
        })
            .then((affected) => {
            console.debug(`${affected} expired session deleted.`);
        })
            .catch((err) => {
            console.error(err);
        });
    }
    startClearExpiredSessions() {
        this.clearExpiredSessionsInterval = setInterval(() => this.clearExpiredSessions.bind(this), this.options.clearInterval);
    }
}
exports.default = DatabaseSessionStore;


/***/ }),

/***/ "./typings/ControllerBase.ts":
/*!***********************************!*\
  !*** ./typings/ControllerBase.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(/*! express */ "express");
class ControllerBase {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }
    getRouter() {
        return this.router;
    }
}
exports.ControllerBase = ControllerBase;


/***/ }),

/***/ "./typings/HttpStatusError.ts":
/*!************************************!*\
  !*** ./typings/HttpStatusError.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class HttpStatusError {
    constructor(value) {
        this.name = value.name || 'HttpStatusError';
        this.code = value.code || 500;
        this.message = value.message || 'An unknown error has occurred.';
        this.inner = value.inner || null;
        this.stack = value.inner ? value.inner.stack : null;
    }
}
exports.HttpStatusError = HttpStatusError;


/***/ }),

/***/ "./typings/JsonResult.ts":
/*!*******************************!*\
  !*** ./typings/JsonResult.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class JsonResult {
    constructor(value) {
        if (value) {
            this.success = value.success;
            this.data = value.data;
            this.message = value.message;
        }
    }
    static getEmptyResult() {
        const result = new JsonResult();
        result.success = false;
        result.data = null;
        result.message = '';
        return result;
    }
    static getErrorResult(err) {
        return new JsonResult({
            success: false,
            data: err,
            message: err.message || err.toString(),
        });
    }
}
exports.JsonResult = JsonResult;
JsonResult.Empty = JsonResult.getEmptyResult();


/***/ }),

/***/ "./typings/defaultUserAttributes.ts":
/*!******************************************!*\
  !*** ./typings/defaultUserAttributes.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUserAttributes = [
    'id',
    'email',
    'username',
    'displayName',
    'photo',
    'isEmailConfirmed',
];


/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bcrypt");

/***/ }),

/***/ "cookie-parser":
/*!********************************!*\
  !*** external "cookie-parser" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cookie-parser");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "express-session":
/*!**********************************!*\
  !*** external "express-session" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-session");

/***/ }),

/***/ "morgan":
/*!*************************!*\
  !*** external "morgan" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),

/***/ "passport":
/*!***************************!*\
  !*** external "passport" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("passport");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("passport-jwt");

/***/ }),

/***/ "passport-local":
/*!*********************************!*\
  !*** external "passport-local" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("passport-local");

/***/ }),

/***/ "sequelize":
/*!****************************!*\
  !*** external "sequelize" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sequelize");

/***/ }),

/***/ "sequelize-typescript":
/*!***************************************!*\
  !*** external "sequelize-typescript" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sequelize-typescript");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vYXBwLnRzIiwid2VicGFjazovLy8uL2NvbmZpZy9jb25maWcudHMiLCJ3ZWJwYWNrOi8vLy4vY29uZmlnL2p3dE9wdGlvbnMudHMiLCJ3ZWJwYWNrOi8vLy4vY29udHJvbGxlcnMvUG9zdHMuY29udHJvbGxlci50cyIsIndlYnBhY2s6Ly8vLi9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9taWRkbGV3YXJlL2Vycm9yUHJvY2Vzcy50cyIsIndlYnBhY2s6Ly8vLi9tb2RlbHMvQ2F0ZWdvcnkubW9kZWwudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kZWxzL0NvbW1lbnQubW9kZWwudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kZWxzL0ltYWdlLm1vZGVsLnRzIiwid2VicGFjazovLy8uL21vZGVscy9Qb3N0Lm1vZGVsLnRzIiwid2VicGFjazovLy8uL21vZGVscy9Qb3N0QWNjZXNzTG9nLm1vZGVsLnRzIiwid2VicGFjazovLy8uL21vZGVscy9Qb3N0Q2F0ZWdvcnkubW9kZWwudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kZWxzL1Bvc3RJbWFnZS5tb2RlbC50cyIsIndlYnBhY2s6Ly8vLi9tb2RlbHMvUG9zdFRhZy5tb2RlbC50cyIsIndlYnBhY2s6Ly8vLi9tb2RlbHMvUmVzZXRQYXNzd29yZENvZGUubW9kZWwudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kZWxzL1RhZy5tb2RlbC50cyIsIndlYnBhY2s6Ly8vLi9tb2RlbHMvVXNlci5tb2RlbC50cyIsIndlYnBhY2s6Ly8vLi9tb2RlbHMvVXNlckxpa2VQb3N0Lm1vZGVsLnRzIiwid2VicGFjazovLy8uL21vZGVscy9Vc2VyVmVyaWZ5Q29kZS5tb2RlbC50cyIsIndlYnBhY2s6Ly8vLi9tb2RlbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vcGFzc3BvcnQvUGFzc3BvcnRJbml0aWFsaXplci50cyIsIndlYnBhY2s6Ly8vLi9wYXNzcG9ydC9TZXNzaW9uLm1vZGVsLnRzIiwid2VicGFjazovLy8uL3Bhc3Nwb3J0L2RhdGFiYXNlU2Vzc2lvblN0b3JlLnRzIiwid2VicGFjazovLy8uL3R5cGluZ3MvQ29udHJvbGxlckJhc2UudHMiLCJ3ZWJwYWNrOi8vLy4vdHlwaW5ncy9IdHRwU3RhdHVzRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vdHlwaW5ncy9Kc29uUmVzdWx0LnRzIiwid2VicGFjazovLy8uL3R5cGluZ3MvZGVmYXVsdFVzZXJBdHRyaWJ1dGVzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcImJjcnlwdFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNvb2tpZS1wYXJzZXJcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjb3JzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZG90ZW52XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3Mtc2Vzc2lvblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm1vcmdhblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBhc3Nwb3J0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGFzc3BvcnQtand0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGFzc3BvcnQtbG9jYWxcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzZXF1ZWxpemVcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzZXF1ZWxpemUtdHlwZXNjcmlwdFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qs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LENBQUM7WUFDbEIsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7U0FDekMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7QUFyQkwsZ0NBa0NDO0FBakNpQixnQkFBSyxHQUF1QixVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ0o3RCw2QkFBcUIsR0FBYTtJQUMzQyxJQUFJO0lBQ0osT0FBTztJQUNQLFVBQVU7SUFDVixhQUFhO0lBQ2IsT0FBTztJQUNQLGtCQUFrQjtDQUNyQixDQUFDOzs7Ozs7Ozs7Ozs7QUNQRixtQzs7Ozs7Ozs7Ozs7QUNBQSwwQzs7Ozs7Ozs7Ozs7QUNBQSxpQzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxvQzs7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxxQzs7Ozs7Ozs7Ozs7QUNBQSx5Qzs7Ozs7Ozs7Ozs7QUNBQSwyQzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSxpRCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2luZGV4LnRzXCIpO1xuIiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCBjb29raWVQYXJzZXIgZnJvbSAnY29va2llLXBhcnNlcic7XHJcbmltcG9ydCBleHByZXNzU2Vzc2lvbiBmcm9tICdleHByZXNzLXNlc3Npb24nO1xyXG5pbXBvcnQgbW9yZ2FuIGZyb20gJ21vcmdhbic7XHJcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xyXG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdCc7XHJcbmltcG9ydCB7IHNlcXVlbGl6ZSB9IGZyb20gJy4vbW9kZWxzJztcclxuaW1wb3J0IHBhc3Nwb3J0ID0gcmVxdWlyZSgncGFzc3BvcnQnKTtcclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vbW9kZWxzL1VzZXIubW9kZWwnO1xyXG5pbXBvcnQgRGF0YWJhc2VTZXNzaW9uU3RvcmUgZnJvbSAnLi9wYXNzcG9ydC9kYXRhYmFzZVNlc3Npb25TdG9yZSc7XHJcbmltcG9ydCB7IElDb250cm9sbGVyQmFzZSB9IGZyb20gJy4vdHlwaW5ncy9JQ29udHJvbGxlckJhc2UnO1xyXG5pbXBvcnQgeyBlcnJvckxvZ2dlciwgZXJyb3JKc29uUmVzdWx0IH0gZnJvbSAnLi9taWRkbGV3YXJlL2Vycm9yUHJvY2Vzcyc7XHJcbmltcG9ydCB7IFBhc3Nwb3J0SW5pdGlhbGl6ZXIgfSBmcm9tICcuL3Bhc3Nwb3J0L1Bhc3Nwb3J0SW5pdGlhbGl6ZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFwcCB7XHJcbiAgICBwdWJsaWMgcG9ydDogbnVtYmVyO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGNvb2tpZU5hbWU6IHN0cmluZyA9IHByb2Nlc3MuZW52LkNPT0tJRV9OQU1FO1xyXG5cclxuICAgIHByaXZhdGUgYXBwOiBleHByZXNzLkFwcGxpY2F0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXJzOiBJQ29udHJvbGxlckJhc2VbXSwgcG9ydD86IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuYXBwID0gZXhwcmVzcygpO1xyXG4gICAgICAgIHRoaXMucG9ydCA9IHBvcnQgfHwgMzAwMDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplRGF0YWJhc2VDb25uZWN0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplUGFzc3BvcnQoKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVNaWRkbGV3YXJlcygpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUNvbnRyb2xsZXJzKGNvbnRyb2xsZXJzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbGlzdGVuKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuYXBwLmxpc3Rlbih0aGlzLnBvcnQsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtBUFBdIEFwcCBpcyBydW5uaW5nIG9uIHRoZSBwb3J0ICR7dGhpcy5wb3J0fWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZURhdGFiYXNlQ29ubmVjdGlvbigpIHtcclxuICAgICAgICBzZXF1ZWxpemVcclxuICAgICAgICAgICAgLnN5bmMoe1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgZm9yY2UgaXMgdHJ1ZSwgZWFjaCBEQU8gd2lsbCBkbyBEUk9QIFRBQkxFIElGIEVYSVNUUyAuLi4sXHJcbiAgICAgICAgICAgICAgICAvLyBiZWZvcmUgaXQgdHJpZXMgdG8gY3JlYXRlIGl0cyBvd24gdGFibGVcclxuICAgICAgICAgICAgICAgIGZvcmNlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIElmIGFsdGVyIGlzIHRydWUsIGVhY2ggREFPIHdpbGwgZG8gQUxURVIgVEFCTEUgLi4uIENIQU5HRSAuLi4gQWx0ZXJzIHRhYmxlcyB0byBmaXQgbW9kZWxzLlxyXG4gICAgICAgICAgICAgICAgLy8gTm90IHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIHVzZS5cclxuICAgICAgICAgICAgICAgIC8vIERlbGV0ZXMgZGF0YSBpbiBjb2x1bW5zIHRoYXQgd2VyZSByZW1vdmVkIG9yIGhhZCB0aGVpciB0eXBlIGNoYW5nZWQgaW4gdGhlIG1vZGVsLlxyXG4gICAgICAgICAgICAgICAgYWx0ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoXykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBUFBdIERhdGFiYXNlIHJlYWR5IScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVQYXNzcG9ydCgpIHtcclxuICAgICAgICBjb25zdCBwYXNzcG9ydEluaXRpYWxpemVyID0gbmV3IFBhc3Nwb3J0SW5pdGlhbGl6ZXIoKTtcclxuXHJcbiAgICAgICAgcGFzc3BvcnRJbml0aWFsaXplci5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplTWlkZGxld2FyZXMoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZGJTZXNzaW9uU3RvcmUgPSBuZXcgRGF0YWJhc2VTZXNzaW9uU3RvcmUoe1xyXG4gICAgICAgICAgICBleHBpcmF0aW9uOiAxMDAwICogNjAgKiA2MCAqIDI0ICogOTAsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYXBwLnVzZShtb3JnYW4oJ2RldicpKTtcclxuXHJcbiAgICAgICAgdGhpcy5hcHAudXNlKGV4cHJlc3MuanNvbigpKTtcclxuICAgICAgICB0aGlzLmFwcC51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xyXG4gICAgICAgIHRoaXMuYXBwLnVzZSgnLycsIGV4cHJlc3Muc3RhdGljKCd1cGxvYWRzJykpO1xyXG5cclxuICAgICAgICB0aGlzLmFwcC51c2UoXHJcbiAgICAgICAgICAgIGNvcnMoe1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmFwcC51c2UoY29va2llUGFyc2VyKHByb2Nlc3MuZW52LkNPT0tJRV9TRUNSRVQpKTtcclxuICAgICAgICB0aGlzLmFwcC51c2UoXHJcbiAgICAgICAgICAgIGV4cHJlc3NTZXNzaW9uKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29va2llTmFtZSxcclxuICAgICAgICAgICAgICAgIHJlc2F2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBzYXZlVW5pbml0aWFsaXplZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBzZWNyZXQ6IHByb2Nlc3MuZW52LkNPT0tJRV9TRUNSRVQsXHJcbiAgICAgICAgICAgICAgICBjb29raWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBodHRwT25seTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLCAvLyBodHRwcyDsgqzsmqnsi5wgdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN0b3JlOiBkYlNlc3Npb25TdG9yZSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5hcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7XHJcbiAgICAgICAgdGhpcy5hcHAudXNlKHBhc3Nwb3J0LnNlc3Npb24oKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplQ29udHJvbGxlcnMoY29udHJvbGxlcnM6IElDb250cm9sbGVyQmFzZVtdKSB7XHJcbiAgICAgICAgY29udHJvbGxlcnMuZm9yRWFjaCgoY29udHJvbGxlciwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hcHAudXNlKGNvbnRyb2xsZXIuZ2V0UGF0aCgpLCBjb250cm9sbGVyLmdldFJvdXRlcigpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gNDA0XHJcbiAgICAgICAgdGhpcy5hcHAuZ2V0KFxyXG4gICAgICAgICAgICAnKicsXHJcbiAgICAgICAgICAgIChcclxuICAgICAgICAgICAgICAgIHJlcTogZXhwcmVzcy5SZXF1ZXN0LFxyXG4gICAgICAgICAgICAgICAgcmVzOiBleHByZXNzLlJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24sXHJcbiAgICAgICAgICAgICkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg0MDQpLnNlbmQoeyBtZXNzYWdlOiBgTm90IGZvdW50OiAke3JlcS51cmx9YCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmFwcC51c2UoZXJyb3JMb2dnZXIpO1xyXG4gICAgICAgIHRoaXMuYXBwLnVzZShlcnJvckpzb25SZXN1bHQpO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52JztcclxuaW1wb3J0IHsgSURhdGFiYXNlQ29uZmlnIH0gZnJvbSAnLi4vdHlwaW5ncy9JRGF0YWJhc2VDb25maWcnO1xyXG5cclxuZG90ZW52LmNvbmZpZygpO1xyXG5cclxuZXhwb3J0IGNvbnN0IHNlcXVlbGl6ZUNvbmZpZzogSURhdGFiYXNlQ29uZmlnID0ge1xyXG4gICAgZGV2ZWxvcG1lbnQ6IHtcclxuICAgICAgICB1c2VybmFtZTogcHJvY2Vzcy5lbnYuREJfVVNFUk5BTUUsXHJcbiAgICAgICAgcGFzc3dvcmQ6IHByb2Nlc3MuZW52LkRCX1BBU1NXT1JELFxyXG4gICAgICAgIGRhdGFiYXNlOiBwcm9jZXNzLmVudi5EQl9EQVRBQkFTRSxcclxuICAgICAgICBob3N0OiBwcm9jZXNzLmVudi5EQl9IT1NULFxyXG4gICAgICAgIHBvcnQ6IHBhcnNlSW50KHByb2Nlc3MuZW52LkRCX1BPUlQgfHwgJzMzMDYnLCAxMCksXHJcbiAgICAgICAgZGlhbGVjdDogJ21hcmlhZGInLFxyXG4gICAgfSxcclxuICAgIHRlc3Q6IHtcclxuICAgICAgICB1c2VybmFtZTogcHJvY2Vzcy5lbnYuREJfVVNFUk5BTUUsXHJcbiAgICAgICAgcGFzc3dvcmQ6IHByb2Nlc3MuZW52LkRCX1BBU1NXT1JELFxyXG4gICAgICAgIGRhdGFiYXNlOiBwcm9jZXNzLmVudi5EQl9EQVRBQkFTRSxcclxuICAgICAgICBob3N0OiBwcm9jZXNzLmVudi5EQl9IT1NULFxyXG4gICAgICAgIHBvcnQ6IHBhcnNlSW50KHByb2Nlc3MuZW52LkRCX1BPUlQgfHwgJzMzMDYnLCAxMCksXHJcbiAgICAgICAgZGlhbGVjdDogJ21hcmlhZGInLFxyXG4gICAgfSxcclxuICAgIHByb2R1Y3Rpb246IHtcclxuICAgICAgICB1c2VybmFtZTogcHJvY2Vzcy5lbnYuREJfVVNFUk5BTUUsXHJcbiAgICAgICAgcGFzc3dvcmQ6IHByb2Nlc3MuZW52LkRCX1BBU1NXT1JELFxyXG4gICAgICAgIGRhdGFiYXNlOiBwcm9jZXNzLmVudi5EQl9EQVRBQkFTRSxcclxuICAgICAgICBob3N0OiBwcm9jZXNzLmVudi5EQl9IT1NULFxyXG4gICAgICAgIHBvcnQ6IHBhcnNlSW50KHByb2Nlc3MuZW52LkRCX1BPUlQgfHwgJzMzMDYnLCAxMCksXHJcbiAgICAgICAgZGlhbGVjdDogJ21hcmlhZGInLFxyXG4gICAgfSxcclxufTtcclxuIiwiaW1wb3J0IHsgSUp3dE9wdGlvbnMgfSBmcm9tICcuLi90eXBpbmdzL0lKd3RPcHRpb25zJztcclxuXHJcbmV4cG9ydCBjb25zdCBqd3RPcHRpb25zOiBJSnd0T3B0aW9ucyA9IHtcclxuICAgIGlzc3VlcjogcHJvY2Vzcy5lbnYuSldUX0lTU1VFUixcclxuICAgIGF1ZGllbmNlOiBwcm9jZXNzLmVudi5KV1RfQVVESUVOQ0UsXHJcbiAgICBzZWNyZXQ6IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsXHJcbn07XHJcbiIsImltcG9ydCBleHByZXNzLCB7IFJlcXVlc3QsIFJlc3BvbnNlLCBOZXh0RnVuY3Rpb24gfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHsgQ29udHJvbGxlckJhc2UgfSBmcm9tICcuLi90eXBpbmdzL0NvbnRyb2xsZXJCYXNlJztcclxuaW1wb3J0IFNlcXVlbGl6ZSwgeyBXaGVyZU9wdGlvbnMsIEFzc29jaWF0aW9uIH0gZnJvbSAnc2VxdWVsaXplJztcclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL21vZGVscy9Vc2VyLm1vZGVsJztcclxuaW1wb3J0IHsgZGVmYXVsdFVzZXJBdHRyaWJ1dGVzIH0gZnJvbSAnLi4vdHlwaW5ncy9kZWZhdWx0VXNlckF0dHJpYnV0ZXMnO1xyXG5pbXBvcnQgeyBQb3N0IH0gZnJvbSAnLi4vbW9kZWxzL1Bvc3QubW9kZWwnO1xyXG5pbXBvcnQgeyBUYWcgfSBmcm9tICcuLi9tb2RlbHMvVGFnLm1vZGVsJztcclxuaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tICcuLi9tb2RlbHMvQ2F0ZWdvcnkubW9kZWwnO1xyXG5pbXBvcnQgeyBQb3N0QWNjZXNzTG9nIH0gZnJvbSAnLi4vbW9kZWxzL1Bvc3RBY2Nlc3NMb2cubW9kZWwnO1xyXG5pbXBvcnQgeyBVc2VyTGlrZVBvc3QgfSBmcm9tICcuLi9tb2RlbHMvVXNlckxpa2VQb3N0Lm1vZGVsJztcclxuaW1wb3J0IHsgSnNvblJlc3VsdCB9IGZyb20gJy4uL3R5cGluZ3MvSnNvblJlc3VsdCc7XHJcbmltcG9ydCB7IElMaXN0UmVzdWx0IH0gZnJvbSAnLi4vdHlwaW5ncy9JTGlzdFJlc3VsdCc7XHJcbmNvbnN0IE9wID0gU2VxdWVsaXplLk9wO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvc3RzQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgIHB1YmxpYyBnZXRQYXRoKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuICcvYXBpL3Bvc3RzJztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZVJvdXRlcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJvdXRlci5nZXQoJy8nLCB0aGlzLmdldFBvc3RzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGdldFBvc3RzKFxyXG4gICAgICAgIHJlcTogUmVxdWVzdCxcclxuICAgICAgICByZXM6IFJlc3BvbnNlLFxyXG4gICAgICAgIG5leHQ6IE5leHRGdW5jdGlvbixcclxuICAgICk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgbGltaXQ6IG51bWJlciA9XHJcbiAgICAgICAgICAgICAgICAocmVxLnF1ZXJ5LmxpbWl0ICYmIHBhcnNlSW50KHJlcS5xdWVyeS5saW1pdCwgMTApKSB8fCAxMDtcclxuICAgICAgICAgICAgY29uc3Qga2V5d29yZDogc3RyaW5nID1cclxuICAgICAgICAgICAgICAgIHJlcS5xdWVyeS5rZXl3b3JkICYmIGRlY29kZVVSSUNvbXBvbmVudChyZXEucXVlcnkua2V5d29yZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VUb2tlbjogbnVtYmVyID1cclxuICAgICAgICAgICAgICAgIChyZXEucXVlcnkucGFnZVRva2VuICYmIHBhcnNlSW50KHJlcS5xdWVyeS5wYWdlVG9rZW4sIDEwKSkgfHwgMDtcclxuICAgICAgICAgICAgY29uc3Qgc2tpcDogbnVtYmVyID0gcGFnZVRva2VuID8gMSA6IDA7XHJcblxyXG4gICAgICAgICAgICBsZXQgd2hlcmU6IFdoZXJlT3B0aW9ucyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGtleXdvcmQpIHtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24od2hlcmUsIHtcclxuICAgICAgICAgICAgICAgICAgICBbT3Aub3JdOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGl0bGU6IHsgW09wLmxpa2VdOiBgJSR7a2V5d29yZH0lYCB9IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbT3AubGlrZV06IGAlJHtrZXl3b3JkfSVgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHsgY291bnQgfSA9IGF3YWl0IFBvc3QuZmluZEFuZENvdW50QWxsKHtcclxuICAgICAgICAgICAgICAgIHdoZXJlOiB3aGVyZSxcclxuICAgICAgICAgICAgICAgIC8vIGluY2x1ZGU6IFtcclxuICAgICAgICAgICAgICAgIC8vICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIG1vZGVsOiBVc2VyLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBhczogJ3VzZXInLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBhdHRyaWJ1dGVzOiBkZWZhdWx0VXNlckF0dHJpYnV0ZXMsXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfSxcclxuICAgICAgICAgICAgICAgIC8vIF0sXHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ2lkJ10sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhZ2VUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYmFzaXNQb3N0ID0gYXdhaXQgUG9zdC5maW5kT25lKHtcclxuICAgICAgICAgICAgICAgICAgICB3aGVyZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcGFnZVRva2VuLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYmFzaXNQb3N0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hlcmUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW09wLmx0XTogYmFzaXNQb3N0LmNyZWF0ZWRBdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwb3N0cyA9IGF3YWl0IFBvc3QuZmluZEFsbCh7XHJcbiAgICAgICAgICAgICAgICB3aGVyZTogd2hlcmUsXHJcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogVXNlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXM6ICd1c2VyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogZGVmYXVsdFVzZXJBdHRyaWJ1dGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogVGFnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ2lkJywgJ3NsdWcnLCAnbmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsnaWQnLCAnc2x1ZycsICduYW1lJywgJ29yZGluYWwnXSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IFBvc3RBY2Nlc3NMb2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsnaWQnXSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IFVzZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzOiAnbGlrZXJzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogWydpZCddLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IFtbJ2NyZWF0ZWRBdCcsICdERVNDJ11dLFxyXG4gICAgICAgICAgICAgICAgbGltaXQ6IGxpbWl0LFxyXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBza2lwLFxyXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICdpZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3RpdGxlJyxcclxuICAgICAgICAgICAgICAgICAgICAnc2x1ZycsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2V4Y2VycHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdjb3ZlckltYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAnY3JlYXRlZEF0JyxcclxuICAgICAgICAgICAgICAgICAgICAndXBkYXRlZEF0JyxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlcy5qc29uKFxyXG4gICAgICAgICAgICAgICAgbmV3IEpzb25SZXN1bHQ8SUxpc3RSZXN1bHQ8UG9zdD4+KHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3JkczogcG9zdHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsOiBjb3VudCxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXh0KGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52JztcclxuaW1wb3J0IHsgQXBwIH0gZnJvbSAnLi9hcHAnO1xyXG5pbXBvcnQgeyBQb3N0c0NvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL1Bvc3RzLmNvbnRyb2xsZXInO1xyXG5cclxuZG90ZW52LmNvbmZpZygpO1xyXG5cclxuY29uc3QgcG9ydCA9IHBhcnNlSW50KHByb2Nlc3MuZW52LlBPUlQgfHwgJzMwMDAnLCAxMCk7XHJcbmNvbnN0IGhvc3QgPSBwcm9jZXNzLmVudi5IT1NUIHx8ICdsb2NhbGhvc3QnO1xyXG5jb25zdCBwcm90b2NvbCA9IHByb2Nlc3MuZW52LlBST1RPQ09MIHx8ICdodHRwJztcclxuXHJcbmNvbnN0IGRldiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbic7XHJcbmNvbnN0IHByb2QgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nO1xyXG5cclxuY29uc3QgYXBwOiBBcHAgPSBuZXcgQXBwKFxyXG4gICAgW1xyXG4gICAgICAgIC8qIOy7qO2KuOuhpOufrCAqL1xyXG4gICAgICAgIG5ldyBQb3N0c0NvbnRyb2xsZXIoKSxcclxuICAgIF0sXHJcbiAgICBwb3J0LFxyXG4pO1xyXG5cclxuYXBwLmxpc3RlbigpO1xyXG4iLCJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHsgSHR0cFN0YXR1c0Vycm9yIH0gZnJvbSAnLi4vdHlwaW5ncy9IdHRwU3RhdHVzRXJyb3InO1xyXG5pbXBvcnQgeyBKc29uUmVzdWx0IH0gZnJvbSAnLi4vdHlwaW5ncy9Kc29uUmVzdWx0JztcclxuXHJcbmNvbnN0IGlzUHJvZCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbic7XHJcblxyXG5leHBvcnQgY29uc3QgZXJyb3JMb2dnZXIgPSAoXHJcbiAgICBlcnI6IEVycm9yLFxyXG4gICAgcmVxOiBleHByZXNzLlJlcXVlc3QsXHJcbiAgICByZXM6IGV4cHJlc3MuUmVzcG9uc2UsXHJcbiAgICBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbixcclxuKSA9PiB7XHJcbiAgICBjb25zb2xlLmVycm9yKGVycik7XHJcblxyXG4gICAgcmV0dXJuIG5leHQoZXJyKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBlcnJvckpzb25SZXN1bHQgPSAoXHJcbiAgICBlcnI6IEVycm9yLFxyXG4gICAgcmVxOiBleHByZXNzLlJlcXVlc3QsXHJcbiAgICByZXM6IGV4cHJlc3MuUmVzcG9uc2UsXHJcbiAgICBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbixcclxuKSA9PiB7XHJcbiAgICBsZXQgZXJyb3I6IEh0dHBTdGF0dXNFcnJvcjtcclxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBIdHRwU3RhdHVzRXJyb3IpIHtcclxuICAgICAgICBlcnJvciA9IGVyciBhcyBIdHRwU3RhdHVzRXJyb3I7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVycm9yID0gbmV3IEh0dHBTdGF0dXNFcnJvcih7XHJcbiAgICAgICAgICAgIGNvZGU6IDUwMCxcclxuICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgIGlubmVyOiBpc1Byb2QgPyBudWxsIDogZXJyLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXMuc3RhdHVzKGVycm9yLmNvZGUpLmpzb24oSnNvblJlc3VsdC5nZXRFcnJvclJlc3VsdChlcnJvcikpO1xyXG59O1xyXG4iLCJpbXBvcnQge1xyXG4gICAgTW9kZWwsXHJcbiAgICBUYWJsZSxcclxuICAgIENvbHVtbixcclxuICAgIENvbW1lbnQsXHJcbiAgICBEYXRhVHlwZSxcclxuICAgIEFsbG93TnVsbCxcclxuICAgIERlZmF1bHQsXHJcbiAgICBGb3JlaWduS2V5LFxyXG4gICAgQmVsb25nc1RvLFxyXG4gICAgQmVsb25nc1RvTWFueSxcclxufSBmcm9tICdzZXF1ZWxpemUtdHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL1VzZXIubW9kZWwnO1xyXG5pbXBvcnQgeyBQb3N0IH0gZnJvbSAnLi9Qb3N0Lm1vZGVsJztcclxuaW1wb3J0IHsgUG9zdENhdGVnb3J5IH0gZnJvbSAnLi9Qb3N0Q2F0ZWdvcnkubW9kZWwnO1xyXG5cclxuQFRhYmxlKHtcclxuICAgIG1vZGVsTmFtZTogJ0NhdGVnb3J5JyxcclxuICAgIHRhYmxlTmFtZTogJ0NhdGVnb3JpZXMnLFxyXG4gICAgY29tbWVudDogJ+u2hOulmCcsXHJcbiAgICB0aW1lc3RhbXBzOiB0cnVlLFxyXG4gICAgY2hhcnNldDogJ3V0ZjhtYjQnLFxyXG4gICAgY29sbGF0ZTogJ3V0ZjhtYjRfZ2VuZXJhbF9jaScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDYXRlZ29yeSBleHRlbmRzIE1vZGVsPENhdGVnb3J5PiB7XHJcbiAgICBAQ29tbWVudCgn7J2066aEJylcclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORygxMDApKVxyXG4gICAgcHVibGljIG5hbWUhOiBzdHJpbmc7XHJcblxyXG4gICAgQENvbW1lbnQoJ+yKrOufrOq3uCcpXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5TVFJJTkcoMTAwKSlcclxuICAgIHB1YmxpYyBzbHVnITogc3RyaW5nO1xyXG5cclxuICAgIEBDb21tZW50KCfstpzroKXsiJzshJwnKVxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBEZWZhdWx0KDEpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLklOVEVHRVIpXHJcbiAgICBwdWJsaWMgb3JkaW5hbCE6IG51bWJlcjtcclxuXHJcbiAgICAvLyBUT0RPIOq0gOqzhFxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBGb3JlaWduS2V5KCgpID0+IFVzZXIpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLklOVEVHRVIpXHJcbiAgICBwdWJsaWMgdXNlcklkOiBudW1iZXI7XHJcblxyXG4gICAgQEJlbG9uZ3NUbygoKSA9PiBVc2VyKVxyXG4gICAgcHVibGljIHVzZXIhOiBVc2VyO1xyXG5cclxuICAgIEBCZWxvbmdzVG9NYW55KCgpID0+IFBvc3QsICgpID0+IFBvc3RDYXRlZ29yeSlcclxuICAgIHB1YmxpYyBwb3N0cyE6IFBvc3RbXTtcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgTW9kZWwsXHJcbiAgICBUYWJsZSxcclxuICAgIENvbHVtbixcclxuICAgIENvbW1lbnQgYXMgQ29sdW1uQ29tbWVudCxcclxuICAgIERhdGFUeXBlLFxyXG4gICAgQWxsb3dOdWxsLFxyXG4gICAgRm9yZWlnbktleSxcclxuICAgIEJlbG9uZ3NUbyxcclxufSBmcm9tICdzZXF1ZWxpemUtdHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL1VzZXIubW9kZWwnO1xyXG5pbXBvcnQgeyBQb3N0IH0gZnJvbSAnLi9Qb3N0Lm1vZGVsJztcclxuXHJcbkBUYWJsZSh7XHJcbiAgICBtb2RlbE5hbWU6ICdDb21tZW50JyxcclxuICAgIHRhYmxlTmFtZTogJ0NvbW1lbnRzJyxcclxuICAgIGNvbW1lbnQ6ICfrjJPquIAnLFxyXG4gICAgdGltZXN0YW1wczogdHJ1ZSxcclxuICAgIGNoYXJzZXQ6ICd1dGY4bWI0JyxcclxuICAgIGNvbGxhdGU6ICd1dGY4bWI0X2dlbmVyYWxfY2knLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsPENvbW1lbnQ+IHtcclxuICAgIEBDb2x1bW5Db21tZW50KCfrp4jtgazri6TsmrQnKVxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuVEVYVClcclxuICAgIHB1YmxpYyBtYXJrZG93biE6IHN0cmluZztcclxuXHJcbiAgICBAQ29sdW1uQ29tbWVudCgnaHRtbCcpXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5URVhUKVxyXG4gICAgcHVibGljIGh0bWwhOiBzdHJpbmc7XHJcblxyXG4gICAgQENvbHVtbkNvbW1lbnQoJ+2FjeyKpO2KuCcpXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5URVhUKVxyXG4gICAgcHVibGljIHRleHQhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBGb3JlaWduS2V5KCgpID0+IFVzZXIpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLklOVEVHRVIpXHJcbiAgICBwdWJsaWMgdXNlcklkITogbnVtYmVyO1xyXG5cclxuICAgIEBCZWxvbmdzVG8oKCkgPT4gVXNlcilcclxuICAgIHB1YmxpYyB1c2VyITogVXNlcjtcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQEZvcmVpZ25LZXkoKCkgPT4gUG9zdClcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuSU5URUdFUilcclxuICAgIHB1YmxpYyBwb3N0SWQhOiBudW1iZXI7XHJcblxyXG4gICAgQEJlbG9uZ3NUbygoKSA9PiBQb3N0KVxyXG4gICAgcHVibGljIHBvc3QhOiBQb3N0O1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBNb2RlbCxcclxuICAgIFRhYmxlLFxyXG4gICAgQ29sdW1uLFxyXG4gICAgQ29tbWVudCxcclxuICAgIERhdGFUeXBlLFxyXG4gICAgQWxsb3dOdWxsLFxyXG4gICAgRGVmYXVsdCxcclxuICAgIEZvcmVpZ25LZXksXHJcbiAgICBCZWxvbmdzVG8sXHJcbiAgICBCZWxvbmdzVG9NYW55LFxyXG59IGZyb20gJ3NlcXVlbGl6ZS10eXBlc2NyaXB0JztcclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vVXNlci5tb2RlbCc7XHJcbmltcG9ydCB7IFBvc3RJbWFnZSB9IGZyb20gJy4vUG9zdEltYWdlLm1vZGVsJztcclxuaW1wb3J0IHsgUG9zdCB9IGZyb20gJy4vUG9zdC5tb2RlbCc7XHJcblxyXG5AVGFibGUoe1xyXG4gICAgbW9kZWxOYW1lOiAnSW1hZ2UnLFxyXG4gICAgdGFibGVOYW1lOiAnSW1hZ2VzJyxcclxuICAgIGNvbW1lbnQ6ICfssqjrtoDtjIzsnbwnLFxyXG4gICAgdGltZXN0YW1wczogdHJ1ZSxcclxuICAgIGNoYXJzZXQ6ICd1dGY4bWI0JyxcclxuICAgIGNvbGxhdGU6ICd1dGY4bWI0X2dlbmVyYWxfY2knLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgSW1hZ2UgZXh0ZW5kcyBNb2RlbDxJbWFnZT4ge1xyXG4gICAgQENvbW1lbnQoJ+ygkeq3vCDqsr3roZwnKVxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDUwMCkpXHJcbiAgICBwdWJsaWMgc3JjITogc3RyaW5nO1xyXG5cclxuICAgIEBDb21tZW50KCfshJzrsoQg6rK966GcJylcclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORyg1MDApKVxyXG4gICAgcHVibGljIHBhdGghOiBzdHJpbmc7XHJcblxyXG4gICAgQENvbW1lbnQoJ+2MjOydvCDsnbTrpoQnKVxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDMwMCkpXHJcbiAgICBwdWJsaWMgZmlsZU5hbWUhOiBzdHJpbmc7XHJcblxyXG4gICAgQENvbW1lbnQoJ+2ZleyepeyekCcpXHJcbiAgICBAQWxsb3dOdWxsKHRydWUpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORygyMCkpXHJcbiAgICBwdWJsaWMgZmlsZUV4dGVuc2lvbiE6IHN0cmluZztcclxuXHJcbiAgICBAQ29tbWVudCgn7YGs6riwJylcclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBARGVmYXVsdCgwKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5CSUdJTlQpXHJcbiAgICBwdWJsaWMgc2l6ZSE6IG51bWJlcjtcclxuXHJcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9rby9kb2NzL1dlYi9IVFRQL0Jhc2ljc19vZl9IVFRQL01JTUVfdHlwZXMvQ29tcGxldGVfbGlzdF9vZl9NSU1FX3R5cGVzXHJcbiAgICBAQ29tbWVudCgn7Luo7YWM7Yq4IO2YleyLnScpXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQERlZmF1bHQoJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORygxMDApKVxyXG4gICAgcHVibGljIGNvbnRlbnRUeXBlITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBARm9yZWlnbktleSgoKSA9PiBVc2VyKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5JTlRFR0VSKVxyXG4gICAgcHVibGljIHVzZXJJZCE6IG51bWJlcjtcclxuXHJcbiAgICBAQmVsb25nc1RvKCgpID0+IFVzZXIpXHJcbiAgICBwdWJsaWMgdXNlciE6IFVzZXI7XHJcblxyXG4gICAgQEJlbG9uZ3NUb01hbnkoKCkgPT4gUG9zdCwgKCkgPT4gUG9zdEltYWdlKVxyXG4gICAgcHVibGljIHBvc3RzITogUG9zdFtdO1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBNb2RlbCxcclxuICAgIFRhYmxlLFxyXG4gICAgQ29sdW1uLFxyXG4gICAgQ29tbWVudCBhcyBDb2x1bW5Db21tZW50LFxyXG4gICAgRGF0YVR5cGUsXHJcbiAgICBBbGxvd051bGwsXHJcbiAgICBVbmlxdWUsXHJcbiAgICBEZWZhdWx0LFxyXG4gICAgQmVsb25nc1RvTWFueSxcclxuICAgIEhhc01hbnksXHJcbiAgICBGb3JlaWduS2V5LFxyXG4gICAgQmVsb25nc1RvLFxyXG59IGZyb20gJ3NlcXVlbGl6ZS10eXBlc2NyaXB0JztcclxuaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tICcuL0NhdGVnb3J5Lm1vZGVsJztcclxuaW1wb3J0IHsgUG9zdENhdGVnb3J5IH0gZnJvbSAnLi9Qb3N0Q2F0ZWdvcnkubW9kZWwnO1xyXG5pbXBvcnQgeyBDb21tZW50IH0gZnJvbSAnLi9Db21tZW50Lm1vZGVsJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuL0ltYWdlLm1vZGVsJztcclxuaW1wb3J0IHsgUG9zdEltYWdlIH0gZnJvbSAnLi9Qb3N0SW1hZ2UubW9kZWwnO1xyXG5pbXBvcnQgeyBUYWcgfSBmcm9tICcuL1RhZy5tb2RlbCc7XHJcbmltcG9ydCB7IFBvc3RUYWcgfSBmcm9tICcuL1Bvc3RUYWcubW9kZWwnO1xyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9Vc2VyLm1vZGVsJztcclxuaW1wb3J0IHsgVXNlckxpa2VQb3N0IH0gZnJvbSAnLi9Vc2VyTGlrZVBvc3QubW9kZWwnO1xyXG5pbXBvcnQgeyBQb3N0QWNjZXNzTG9nIH0gZnJvbSAnLi9Qb3N0QWNjZXNzTG9nLm1vZGVsJztcclxuXHJcbkBUYWJsZSh7XHJcbiAgICBtb2RlbE5hbWU6ICdQb3N0JyxcclxuICAgIHRhYmxlTmFtZTogJ1Bvc3RzJyxcclxuICAgIGNvbW1lbnQ6ICfquIAnLFxyXG4gICAgdGltZXN0YW1wczogdHJ1ZSxcclxuICAgIGNoYXJzZXQ6ICd1dGY4bWI0JyxcclxuICAgIGNvbGxhdGU6ICd1dGY4bWI0X2dlbmVyYWxfY2knLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsPFBvc3Q+IHtcclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORyg1MDApKVxyXG4gICAgcHVibGljIHRpdGxlITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAVW5pcXVlXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORygyMDApKVxyXG4gICAgcHVibGljIHNsdWchOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuVEVYVClcclxuICAgIHB1YmxpYyBtYXJrZG93biE6IHN0cmluZztcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5URVhUKVxyXG4gICAgcHVibGljIGh0bWwhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuVEVYVClcclxuICAgIHB1YmxpYyB0ZXh0ITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlRFWFQpXHJcbiAgICBwdWJsaWMgZXhjZXJwdCE6IHN0cmluZztcclxuXHJcbiAgICBAQWxsb3dOdWxsKHRydWUpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORyg1MDApKVxyXG4gICAgcHVibGljIGNvdmVySW1hZ2UhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBEZWZhdWx0KGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5CT09MRUFOKVxyXG4gICAgcHVibGljIGlzUHVibGlzaGVkITogYm9vbGVhbjtcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQERlZmF1bHQoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLkJPT0xFQU4pXHJcbiAgICBwdWJsaWMgaXNQcml2YXRlITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwodHJ1ZSlcclxuICAgIEBEZWZhdWx0KGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5TVFJJTkcoNTAwKSlcclxuICAgIHB1YmxpYyBwYXNzd29yZCE6IHN0cmluZztcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQERlZmF1bHQoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLkJPT0xFQU4pXHJcbiAgICBwdWJsaWMgaXNQaW5uZWQhOiBib29sZWFuO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBARGVmYXVsdChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuQk9PTEVBTilcclxuICAgIHB1YmxpYyBpc0RlbGV0ZWQhOiBib29sZWFuO1xyXG5cclxuICAgIEBBbGxvd051bGwodHJ1ZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuREFURSlcclxuICAgIHB1YmxpYyBkZWxldGVkQXQ/OiBEYXRlO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBARm9yZWlnbktleSgoKSA9PiBVc2VyKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5JTlRFR0VSKVxyXG4gICAgcHVibGljIHVzZXJJZCE6IG51bWJlcjtcclxuXHJcbiAgICBAQmVsb25nc1RvKCgpID0+IFVzZXIsIHsgYXM6ICd1c2VyJywgZm9yZWlnbktleTogJ3VzZXJJZCcgfSlcclxuICAgIHB1YmxpYyB1c2VyITogVXNlcjtcclxuXHJcbiAgICBAQmVsb25nc1RvTWFueSgoKSA9PiBDYXRlZ29yeSwgKCkgPT4gUG9zdENhdGVnb3J5KVxyXG4gICAgcHVibGljIGNhdGVnb3JpZXMhOiBDYXRlZ29yeVtdO1xyXG5cclxuICAgIEBIYXNNYW55KCgpID0+IENvbW1lbnQpXHJcbiAgICBwdWJsaWMgY29tbWVudHMhOiBDb21tZW50W107XHJcblxyXG4gICAgQEhhc01hbnkoKCkgPT4gUG9zdEFjY2Vzc0xvZylcclxuICAgIHB1YmxpYyBhY2Nlc3NMb2dzITogUG9zdEFjY2Vzc0xvZ1tdO1xyXG5cclxuICAgIEBCZWxvbmdzVG9NYW55KCgpID0+IEltYWdlLCAoKSA9PiBQb3N0SW1hZ2UpXHJcbiAgICBwdWJsaWMgaW1hZ2VzITogSW1hZ2VbXTtcclxuXHJcbiAgICBAQmVsb25nc1RvTWFueSgoKSA9PiBUYWcsICgpID0+IFBvc3RUYWcpXHJcbiAgICBwdWJsaWMgdGFncyE6IFRhZ1tdO1xyXG5cclxuICAgIEBCZWxvbmdzVG9NYW55KCgpID0+IFVzZXIsIHsgdGhyb3VnaDogKCkgPT4gVXNlckxpa2VQb3N0LCBhczogJ2xpa2VycycgfSlcclxuICAgIC8vIEBCZWxvbmdzVG9NYW55KCgpID0+IFVzZXIsICgpID0+IFVzZXJMaWtlUG9zdClcclxuICAgIHB1YmxpYyBsaWtlcnMhOiBVc2VyW107XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICAgIE1vZGVsLFxyXG4gICAgVGFibGUsXHJcbiAgICBDb2x1bW4sXHJcbiAgICBDb21tZW50LFxyXG4gICAgRGF0YVR5cGUsXHJcbiAgICBBbGxvd051bGwsXHJcbiAgICBVbmlxdWUsXHJcbiAgICBEZWZhdWx0LFxyXG4gICAgRm9yZWlnbktleSxcclxuICAgIEJlbG9uZ3NUbyxcclxufSBmcm9tICdzZXF1ZWxpemUtdHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7IFBvc3QgfSBmcm9tICcuL1Bvc3QubW9kZWwnO1xyXG5cclxuQFRhYmxlKHtcclxuICAgIG1vZGVsTmFtZTogJ1Bvc3RBY2Nlc3NMb2cnLFxyXG4gICAgdGFibGVOYW1lOiAnUG9zdEFjY2Vzc0xvZ3MnLFxyXG4gICAgY29tbWVudDogJ+q4gCDsoJHqt7wg66Gc6re4JyxcclxuICAgIHRpbWVzdGFtcHM6IHRydWUsXHJcbiAgICBjaGFyc2V0OiAndXRmOG1iNCcsXHJcbiAgICBjb2xsYXRlOiAndXRmOG1iNF9nZW5lcmFsX2NpJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIFBvc3RBY2Nlc3NMb2cgZXh0ZW5kcyBNb2RlbDxQb3N0QWNjZXNzTG9nPiB7XHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5TVFJJTkcoMTAwKSlcclxuICAgIHB1YmxpYyBpcEFkZHJlc3MhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDUwMCkpXHJcbiAgICBwdWJsaWMgdXNlckFnZW50ITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwodHJ1ZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuSU5URUdFUilcclxuICAgIHB1YmxpYyB1c2VySWQ6IG51bWJlcjtcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQEZvcmVpZ25LZXkoKCkgPT4gUG9zdClcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuSU5URUdFUilcclxuICAgIHB1YmxpYyBwb3N0SWQ6IG51bWJlcjtcclxuXHJcbiAgICBAQmVsb25nc1RvKCgpID0+IFBvc3QpXHJcbiAgICBwdWJsaWMgcG9zdCE6IFBvc3Q7XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICAgIE1vZGVsLFxyXG4gICAgVGFibGUsXHJcbiAgICBDb2x1bW4sXHJcbiAgICBDb21tZW50LFxyXG4gICAgRGF0YVR5cGUsXHJcbiAgICBBbGxvd051bGwsXHJcbiAgICBEZWZhdWx0LFxyXG4gICAgRm9yZWlnbktleSxcclxuICAgIEJlbG9uZ3NUbyxcclxuICAgIFByaW1hcnlLZXksXHJcbn0gZnJvbSAnc2VxdWVsaXplLXR5cGVzY3JpcHQnO1xyXG5pbXBvcnQgeyBQb3N0IH0gZnJvbSAnLi9Qb3N0Lm1vZGVsJztcclxuaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tICcuL0NhdGVnb3J5Lm1vZGVsJztcclxuXHJcbkBUYWJsZSh7XHJcbiAgICBtb2RlbE5hbWU6ICdQb3N0Q2F0ZWdvcnknLFxyXG4gICAgdGFibGVOYW1lOiAnUG9zdENhdGVnb3J5JyxcclxuICAgIGNvbW1lbnQ6ICfquIAt67aE66WYJyxcclxuICAgIHRpbWVzdGFtcHM6IHRydWUsXHJcbiAgICBjaGFyc2V0OiAndXRmOG1iNCcsXHJcbiAgICBjb2xsYXRlOiAndXRmOG1iNF9nZW5lcmFsX2NpJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIFBvc3RDYXRlZ29yeSBleHRlbmRzIE1vZGVsPFBvc3RDYXRlZ29yeT4ge1xyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBQcmltYXJ5S2V5XHJcbiAgICBARm9yZWlnbktleSgoKSA9PiBQb3N0KVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5JTlRFR0VSKVxyXG4gICAgcHVibGljIHBvc3RJZDogbnVtYmVyO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAUHJpbWFyeUtleVxyXG4gICAgQEZvcmVpZ25LZXkoKCkgPT4gQ2F0ZWdvcnkpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLklOVEVHRVIpXHJcbiAgICBwdWJsaWMgY2F0ZWdvcnlJZCE6IG51bWJlcjtcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgTW9kZWwsXHJcbiAgICBUYWJsZSxcclxuICAgIENvbHVtbixcclxuICAgIENvbW1lbnQsXHJcbiAgICBEYXRhVHlwZSxcclxuICAgIEFsbG93TnVsbCxcclxuICAgIERlZmF1bHQsXHJcbiAgICBGb3JlaWduS2V5LFxyXG4gICAgQmVsb25nc1RvLFxyXG4gICAgUHJpbWFyeUtleSxcclxufSBmcm9tICdzZXF1ZWxpemUtdHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7IFBvc3QgfSBmcm9tICcuL1Bvc3QubW9kZWwnO1xyXG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJy4vSW1hZ2UubW9kZWwnO1xyXG5cclxuQFRhYmxlKHtcclxuICAgIG1vZGVsTmFtZTogJ1Bvc3RJbWFnZScsXHJcbiAgICB0YWJsZU5hbWU6ICdQb3N0SW1hZ2UnLCAvLyBUT0RPIO2FjOydtOu4lCDsnbTrpoQg7ZmV7J24XHJcbiAgICBjb21tZW50OiAn7LKo67aA7YyM7J28JyxcclxuICAgIHRpbWVzdGFtcHM6IHRydWUsXHJcbiAgICBjaGFyc2V0OiAndXRmOG1iNCcsXHJcbiAgICBjb2xsYXRlOiAndXRmOG1iNF9nZW5lcmFsX2NpJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIFBvc3RJbWFnZSBleHRlbmRzIE1vZGVsPFBvc3RJbWFnZT4ge1xyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBQcmltYXJ5S2V5XHJcbiAgICBARm9yZWlnbktleSgoKSA9PiBQb3N0KVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5JTlRFR0VSKVxyXG4gICAgcHVibGljIHBvc3RJZCE6IG51bWJlcjtcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQFByaW1hcnlLZXlcclxuICAgIEBGb3JlaWduS2V5KCgpID0+IEltYWdlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5JTlRFR0VSKVxyXG4gICAgcHVibGljIGltYWdlSWQhOiBudW1iZXI7XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICAgIE1vZGVsLFxyXG4gICAgVGFibGUsXHJcbiAgICBDb2x1bW4sXHJcbiAgICBDb21tZW50LFxyXG4gICAgRGF0YVR5cGUsXHJcbiAgICBBbGxvd051bGwsXHJcbiAgICBEZWZhdWx0LFxyXG4gICAgRm9yZWlnbktleSxcclxuICAgIEJlbG9uZ3NUbyxcclxuICAgIFByaW1hcnlLZXksXHJcbn0gZnJvbSAnc2VxdWVsaXplLXR5cGVzY3JpcHQnO1xyXG5pbXBvcnQgeyBQb3N0IH0gZnJvbSAnLi9Qb3N0Lm1vZGVsJztcclxuaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi9UYWcubW9kZWwnO1xyXG5cclxuQFRhYmxlKHtcclxuICAgIG1vZGVsTmFtZTogJ1Bvc3RUYWcnLFxyXG4gICAgdGFibGVOYW1lOiAnUG9zdFRhZycsXHJcbiAgICBjb21tZW50OiAn6riALe2DnOq3uCcsXHJcbiAgICB0aW1lc3RhbXBzOiB0cnVlLFxyXG4gICAgY2hhcnNldDogJ3V0ZjhtYjQnLFxyXG4gICAgY29sbGF0ZTogJ3V0ZjhtYjRfZ2VuZXJhbF9jaScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQb3N0VGFnIGV4dGVuZHMgTW9kZWw8UG9zdFRhZz4ge1xyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBQcmltYXJ5S2V5XHJcbiAgICBARm9yZWlnbktleSgoKSA9PiBQb3N0KVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5JTlRFR0VSKVxyXG4gICAgcHVibGljIHBvc3RJZCE6IG51bWJlcjtcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQFByaW1hcnlLZXlcclxuICAgIEBGb3JlaWduS2V5KCgpID0+IFRhZylcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuSU5URUdFUilcclxuICAgIHB1YmxpYyB0YWdJZCE6IG51bWJlcjtcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgTW9kZWwsXHJcbiAgICBUYWJsZSxcclxuICAgIENvbHVtbixcclxuICAgIENvbW1lbnQsXHJcbiAgICBEYXRhVHlwZSxcclxuICAgIEFsbG93TnVsbCxcclxuICAgIFVuaXF1ZSxcclxuICAgIERlZmF1bHQsXHJcbiAgICBGb3JlaWduS2V5LFxyXG4gICAgQmVsb25nc1RvLFxyXG59IGZyb20gJ3NlcXVlbGl6ZS10eXBlc2NyaXB0JztcclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vVXNlci5tb2RlbCc7XHJcblxyXG5AVGFibGUoe1xyXG4gICAgbW9kZWxOYW1lOiAnUmVzZXRQYXNzd29yZENvZGUnLFxyXG4gICAgdGFibGVOYW1lOiAnUmVzZXRQYXNzd29yZENvZGVzJywgLy8gVE9ETyDthYzsnbTruJQg7J2066aEIO2ZleyduFxyXG4gICAgY29tbWVudDogJ+u5hOuwgOuyiO2YuCDrs4Dqsr0g7JqU7LKtIOy9lOuTnCcsXHJcbiAgICB0aW1lc3RhbXBzOiB0cnVlLFxyXG4gICAgY2hhcnNldDogJ3V0ZjhtYjQnLFxyXG4gICAgY29sbGF0ZTogJ3V0ZjhtYjRfZ2VuZXJhbF9jaScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBSZXNldFBhc3N3b3JkQ29kZSBleHRlbmRzIE1vZGVsPFJlc2V0UGFzc3dvcmRDb2RlPiB7XHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5TVFJJTkcoMjAwKSlcclxuICAgIHB1YmxpYyBlbWFpbCE6IHN0cmluZztcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5TVFJJTkcoNTAwKSlcclxuICAgIHB1YmxpYyBjb2RlITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORyg1MDApKVxyXG4gICAgcHVibGljIHBhc3N3b3JkITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLkRBVEUpXHJcbiAgICBwdWJsaWMgZXhwaXJlZCE6IERhdGU7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBGb3JlaWduS2V5KCgpID0+IFVzZXIpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLklOVEVHRVIpXHJcbiAgICBwdWJsaWMgdXNlcklkITogbnVtYmVyO1xyXG5cclxuICAgIEBCZWxvbmdzVG8oKCkgPT4gVXNlcilcclxuICAgIHB1YmxpYyB1c2VyITogVXNlcjtcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgTW9kZWwsXHJcbiAgICBUYWJsZSxcclxuICAgIENvbHVtbixcclxuICAgIENvbW1lbnQsXHJcbiAgICBEYXRhVHlwZSxcclxuICAgIEFsbG93TnVsbCxcclxuICAgIFVuaXF1ZSxcclxuICAgIERlZmF1bHQsXHJcbiAgICBCZWxvbmdzVG9NYW55LFxyXG59IGZyb20gJ3NlcXVlbGl6ZS10eXBlc2NyaXB0JztcclxuaW1wb3J0IHsgUG9zdCB9IGZyb20gJy4vUG9zdC5tb2RlbCc7XHJcbmltcG9ydCB7IFBvc3RUYWcgfSBmcm9tICcuL1Bvc3RUYWcubW9kZWwnO1xyXG5cclxuQFRhYmxlKHtcclxuICAgIG1vZGVsTmFtZTogJ1RhZycsXHJcbiAgICB0YWJsZU5hbWU6ICdUYWdzJywgLy8gVE9ETyDthYzsnbTruJQg7J2066aEIO2ZleyduFxyXG4gICAgY29tbWVudDogJ+2DnOq3uCcsXHJcbiAgICB0aW1lc3RhbXBzOiB0cnVlLFxyXG4gICAgY2hhcnNldDogJ3V0ZjhtYjQnLFxyXG4gICAgY29sbGF0ZTogJ3V0ZjhtYjRfZ2VuZXJhbF9jaScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUYWcgZXh0ZW5kcyBNb2RlbDxUYWc+IHtcclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORygxMDApKVxyXG4gICAgcHVibGljIG5hbWUhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDEwMCkpXHJcbiAgICBwdWJsaWMgc2x1ZyE6IHN0cmluZztcclxuXHJcbiAgICBAQmVsb25nc1RvTWFueSgoKSA9PiBQb3N0LCAoKSA9PiBQb3N0VGFnKVxyXG4gICAgcHVibGljIHBvc3RzITogUG9zdFtdO1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBNb2RlbCxcclxuICAgIFRhYmxlLFxyXG4gICAgQ29sdW1uLFxyXG4gICAgQ29tbWVudCBhcyBDb2x1bW5Db21tZW50LFxyXG4gICAgRGF0YVR5cGUsXHJcbiAgICBBbGxvd051bGwsXHJcbiAgICBVbmlxdWUsXHJcbiAgICBEZWZhdWx0LFxyXG4gICAgSGFzTWFueSxcclxuICAgIEJlbG9uZ3NUb01hbnksXHJcbn0gZnJvbSAnc2VxdWVsaXplLXR5cGVzY3JpcHQnO1xyXG5pbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gJy4vQ2F0ZWdvcnkubW9kZWwnO1xyXG5pbXBvcnQgeyBDb21tZW50IH0gZnJvbSAnLi9Db21tZW50Lm1vZGVsJztcclxuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICcuL0ltYWdlLm1vZGVsJztcclxuaW1wb3J0IHsgUG9zdCB9IGZyb20gJy4vUG9zdC5tb2RlbCc7XHJcbmltcG9ydCB7IFVzZXJMaWtlUG9zdCB9IGZyb20gJy4vVXNlckxpa2VQb3N0Lm1vZGVsJztcclxuaW1wb3J0IHsgVXNlclZlcmlmeUNvZGUgfSBmcm9tICcuL1VzZXJWZXJpZnlDb2RlLm1vZGVsJztcclxuaW1wb3J0IHsgUmVzZXRQYXNzd29yZENvZGUgfSBmcm9tICcuL1Jlc2V0UGFzc3dvcmRDb2RlLm1vZGVsJztcclxuXHJcbkBUYWJsZSh7XHJcbiAgICBtb2RlbE5hbWU6ICdVc2VyJyxcclxuICAgIHRhYmxlTmFtZTogJ1VzZXJzJywgLy8gVE9ETyDthYzsnbTruJQg7J2066aEIO2ZleyduFxyXG4gICAgY29tbWVudDogJ+yCrOyaqeyekCcsXHJcbiAgICB0aW1lc3RhbXBzOiB0cnVlLFxyXG4gICAgY2hhcnNldDogJ3V0ZjhtYjQnLFxyXG4gICAgY29sbGF0ZTogJ3V0ZjhtYjRfZ2VuZXJhbF9jaScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBVc2VyIGV4dGVuZHMgTW9kZWw8VXNlcj4ge1xyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDEwMCkpXHJcbiAgICBwdWJsaWMgdXNlcm5hbWUhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDEwMCkpXHJcbiAgICBwdWJsaWMgZGlzcGxheU5hbWUhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDIwMCkpXHJcbiAgICBwdWJsaWMgZW1haWwhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuU1RSSU5HKDUwMCkpXHJcbiAgICBwdWJsaWMgcGFzc3dvcmQhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBEZWZhdWx0KGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5CT09MRUFOKVxyXG4gICAgcHVibGljIGlzRW1haWxDb25maXJtZWQhOiBib29sZWFuO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORyg1MDApKVxyXG4gICAgcHVibGljIHBob3RvITogc3RyaW5nO1xyXG5cclxuICAgIEBIYXNNYW55KCgpID0+IENhdGVnb3J5KVxyXG4gICAgcHVibGljIGNhdGVnb3JpZXMhOiBDYXRlZ29yeVtdO1xyXG5cclxuICAgIEBIYXNNYW55KCgpID0+IENvbW1lbnQpXHJcbiAgICBwdWJsaWMgY29tbWVudHMhOiBDb21tZW50W107XHJcblxyXG4gICAgQEhhc01hbnkoKCkgPT4gSW1hZ2UpXHJcbiAgICBwdWJsaWMgaW1hZ2VzITogSW1hZ2VbXTtcclxuXHJcbiAgICBASGFzTWFueSgoKSA9PiBQb3N0KVxyXG4gICAgcHVibGljIHBvc3RzITogUG9zdFtdO1xyXG5cclxuICAgIEBCZWxvbmdzVG9NYW55KCgpID0+IFBvc3QsICgpID0+IFVzZXJMaWtlUG9zdClcclxuICAgIHB1YmxpYyBsaWtlZFBvc3RzOiBQb3N0W107XHJcblxyXG4gICAgQEhhc01hbnkoKCkgPT4gVXNlclZlcmlmeUNvZGUpXHJcbiAgICBwdWJsaWMgdmVyaWZ5Q29kZXM6IFVzZXJWZXJpZnlDb2RlW107XHJcblxyXG4gICAgQEhhc01hbnkoKCkgPT4gUmVzZXRQYXNzd29yZENvZGUpXHJcbiAgICBwdWJsaWMgcmVzZXRQYXNzd29yZENvZGVzOiBSZXNldFBhc3N3b3JkQ29kZVtdO1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBNb2RlbCxcclxuICAgIFRhYmxlLFxyXG4gICAgQ29sdW1uLFxyXG4gICAgQ29tbWVudCxcclxuICAgIERhdGFUeXBlLFxyXG4gICAgQWxsb3dOdWxsLFxyXG4gICAgVW5pcXVlLFxyXG4gICAgRGVmYXVsdCxcclxuICAgIFByaW1hcnlLZXksXHJcbiAgICBGb3JlaWduS2V5LFxyXG59IGZyb20gJ3NlcXVlbGl6ZS10eXBlc2NyaXB0JztcclxuaW1wb3J0IHsgUG9zdCB9IGZyb20gJy4vUG9zdC5tb2RlbCc7XHJcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL1VzZXIubW9kZWwnO1xyXG5cclxuQFRhYmxlKHtcclxuICAgIG1vZGVsTmFtZTogJ1VzZXJMaWtlUG9zdCcsXHJcbiAgICB0YWJsZU5hbWU6ICdVc2VyTGlrZVBvc3QnLFxyXG4gICAgY29tbWVudDogJ+q4gC3soovslYTsmpQnLFxyXG4gICAgdGltZXN0YW1wczogdHJ1ZSxcclxuICAgIGNoYXJzZXQ6ICd1dGY4bWI0JyxcclxuICAgIGNvbGxhdGU6ICd1dGY4bWI0X2dlbmVyYWxfY2knLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgVXNlckxpa2VQb3N0IGV4dGVuZHMgTW9kZWw8VXNlckxpa2VQb3N0PiB7XHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQFByaW1hcnlLZXlcclxuICAgIEBGb3JlaWduS2V5KCgpID0+IFBvc3QpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLklOVEVHRVIpXHJcbiAgICBwdWJsaWMgcG9zdElkITogbnVtYmVyO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAUHJpbWFyeUtleVxyXG4gICAgQEZvcmVpZ25LZXkoKCkgPT4gVXNlcilcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuSU5URUdFUilcclxuICAgIHB1YmxpYyB1c2VySWQhOiBudW1iZXI7XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICAgIE1vZGVsLFxyXG4gICAgVGFibGUsXHJcbiAgICBDb2x1bW4sXHJcbiAgICBDb21tZW50LFxyXG4gICAgRGF0YVR5cGUsXHJcbiAgICBBbGxvd051bGwsXHJcbiAgICBVbmlxdWUsXHJcbiAgICBEZWZhdWx0LFxyXG4gICAgUHJpbWFyeUtleSxcclxuICAgIEZvcmVpZ25LZXksXHJcbiAgICBCZWxvbmdzVG8sXHJcbn0gZnJvbSAnc2VxdWVsaXplLXR5cGVzY3JpcHQnO1xyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9Vc2VyLm1vZGVsJztcclxuXHJcbkBUYWJsZSh7XHJcbiAgICBtb2RlbE5hbWU6ICdVc2VyVmVyaWZ5Q29kZScsXHJcbiAgICB0YWJsZU5hbWU6ICdVc2VyVmVyaWZ5Q29kZXMnLFxyXG4gICAgY29tbWVudDogJ+yghOyekOyasO2OuCDtmZXsnbgg7L2U65OcJyxcclxuICAgIHRpbWVzdGFtcHM6IHRydWUsXHJcbiAgICBjaGFyc2V0OiAndXRmOG1iNCcsXHJcbiAgICBjb2xsYXRlOiAndXRmOG1iNF9nZW5lcmFsX2NpJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIFVzZXJWZXJpZnlDb2RlIGV4dGVuZHMgTW9kZWw8VXNlclZlcmlmeUNvZGU+IHtcclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORygyMDApKVxyXG4gICAgcHVibGljIGVtYWlsITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlNUUklORyg1MDApKVxyXG4gICAgcHVibGljIGNvZGUhOiBzdHJpbmc7XHJcblxyXG4gICAgQEFsbG93TnVsbChmYWxzZSlcclxuICAgIEBDb2x1bW4oRGF0YVR5cGUuREFURSlcclxuICAgIHB1YmxpYyBleHBpcmUhOiBEYXRlO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBARm9yZWlnbktleSgoKSA9PiBVc2VyKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5JTlRFR0VSKVxyXG4gICAgcHVibGljIHVzZXJJZCE6IG51bWJlcjtcclxuXHJcbiAgICBAQmVsb25nc1RvKCgpID0+IFVzZXIpXHJcbiAgICBwdWJsaWMgdXNlciE6IFVzZXI7XHJcbn1cclxuIiwiaW1wb3J0IHsgU2VxdWVsaXplLCBTZXF1ZWxpemVPcHRpb25zIH0gZnJvbSAnc2VxdWVsaXplLXR5cGVzY3JpcHQnO1xyXG5pbXBvcnQgeyBzZXF1ZWxpemVDb25maWcgfSBmcm9tICcuLi9jb25maWcvY29uZmlnJztcclxuaW1wb3J0IHsgSURhdGFiYXNlQ29uZmlnSXRlbSB9IGZyb20gJy4uL3R5cGluZ3MvSURhdGFiYXNlQ29uZmlnSXRlbSc7XHJcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL1VzZXIubW9kZWwnO1xyXG5pbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gJy4vQ2F0ZWdvcnkubW9kZWwnO1xyXG5pbXBvcnQgeyBQb3N0IH0gZnJvbSAnLi9Qb3N0Lm1vZGVsJztcclxuaW1wb3J0IHsgQ29tbWVudCB9IGZyb20gJy4vQ29tbWVudC5tb2RlbCc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi9JbWFnZS5tb2RlbCc7XHJcbmltcG9ydCB7IFBvc3RBY2Nlc3NMb2cgfSBmcm9tICcuL1Bvc3RBY2Nlc3NMb2cubW9kZWwnO1xyXG5pbXBvcnQgeyBQb3N0Q2F0ZWdvcnkgfSBmcm9tICcuL1Bvc3RDYXRlZ29yeS5tb2RlbCc7XHJcbmltcG9ydCB7IFBvc3RJbWFnZSB9IGZyb20gJy4vUG9zdEltYWdlLm1vZGVsJztcclxuaW1wb3J0IHsgUG9zdFRhZyB9IGZyb20gJy4vUG9zdFRhZy5tb2RlbCc7XHJcbmltcG9ydCB7IFRhZyB9IGZyb20gJy4vVGFnLm1vZGVsJztcclxuaW1wb3J0IHsgUmVzZXRQYXNzd29yZENvZGUgfSBmcm9tICcuL1Jlc2V0UGFzc3dvcmRDb2RlLm1vZGVsJztcclxuaW1wb3J0IHsgVXNlckxpa2VQb3N0IH0gZnJvbSAnLi9Vc2VyTGlrZVBvc3QubW9kZWwnO1xyXG5pbXBvcnQgeyBVc2VyVmVyaWZ5Q29kZSB9IGZyb20gJy4vVXNlclZlcmlmeUNvZGUubW9kZWwnO1xyXG5pbXBvcnQgeyBTZXNzaW9uIH0gZnJvbSAnLi4vcGFzc3BvcnQvU2Vzc2lvbi5tb2RlbCc7XHJcblxyXG5jb25zdCBlbnYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnO1xyXG5jb25zdCBjb25maWc6IElEYXRhYmFzZUNvbmZpZ0l0ZW0gPSBzZXF1ZWxpemVDb25maWdbZW52XTtcclxuXHJcbmNvbnN0IHNlcXVlbGl6ZU9wdGlvbnM6IFNlcXVlbGl6ZU9wdGlvbnMgPSB7XHJcbiAgICAuLi5jb25maWcsXHJcbiAgICBtb2RlbHM6IFtcclxuICAgICAgICBTZXNzaW9uLFxyXG4gICAgICAgIFVzZXIsXHJcbiAgICAgICAgQ2F0ZWdvcnksXHJcbiAgICAgICAgUG9zdCxcclxuICAgICAgICBDb21tZW50LFxyXG4gICAgICAgIEltYWdlLFxyXG4gICAgICAgIFRhZyxcclxuICAgICAgICBQb3N0QWNjZXNzTG9nLFxyXG4gICAgICAgIFBvc3RDYXRlZ29yeSxcclxuICAgICAgICBQb3N0SW1hZ2UsXHJcbiAgICAgICAgUG9zdFRhZyxcclxuICAgICAgICBSZXNldFBhc3N3b3JkQ29kZSxcclxuICAgICAgICBVc2VyTGlrZVBvc3QsXHJcbiAgICAgICAgVXNlclZlcmlmeUNvZGUsXHJcbiAgICBdLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHNlcXVlbGl6ZSA9IG5ldyBTZXF1ZWxpemUoc2VxdWVsaXplT3B0aW9ucyk7XHJcbiIsImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xyXG5pbXBvcnQgcGFzc3BvcnQgZnJvbSAncGFzc3BvcnQnO1xyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vbW9kZWxzL1VzZXIubW9kZWwnO1xyXG5pbXBvcnQgeyBTdHJhdGVneSBhcyBKd3RTdHJhdGVneSwgRXh0cmFjdEp3dCB9IGZyb20gJ3Bhc3Nwb3J0LWp3dCc7XHJcbmltcG9ydCB7IGp3dE9wdGlvbnMgfSBmcm9tICcuLi9jb25maWcvand0T3B0aW9ucyc7XHJcbmltcG9ydCB7XHJcbiAgICBTdHJhdGVneSBhcyBMb2NhbFN0cmF0ZWd5LFxyXG4gICAgSVZlcmlmeU9wdGlvbnMsXHJcbiAgICBJU3RyYXRlZ3lPcHRpb25zV2l0aFJlcXVlc3QsXHJcbn0gZnJvbSAncGFzc3BvcnQtbG9jYWwnO1xyXG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdCc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGFzc3BvcnRJbml0aWFsaXplciB7XHJcbiAgICBwdWJsaWMgaW5pdCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVQYXNzcHJ0KCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTG9jYWwoKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVKd3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVQYXNzcHJ0KCkge1xyXG4gICAgICAgIHBhc3Nwb3J0LnNlcmlhbGl6ZVVzZXIoKHVzZXI6IFVzZXIsIGRvbmU6IGFueSk6IHZvaWQgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdwYXNzcG9ydC5zZXJpYWxpemVVc2VyJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBkb25lKG51bGwsIHVzZXIuaWQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwYXNzcG9ydC5kZXNlcmlhbGl6ZVVzZXIoYXN5bmMgKGlkOiBudW1iZXIsIGRvbmUpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnPj4+PiBwYXNzcG9ydC5kZXNlcmlhbGl6ZVVzZXInKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHdoZXJlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2lkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3VzZXJuYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpc3BsYXlOYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3Bob3RvJyxcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUobnVsbCwgdXNlcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlLCBudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZUxvY2FsKCk6IHZvaWQge1xyXG4gICAgICAgIHBhc3Nwb3J0LnVzZShcclxuICAgICAgICAgICAgbmV3IExvY2FsU3RyYXRlZ3koXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWVGaWVsZDogJ3VzZXJuYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZEZpZWxkOiAncGFzc3dvcmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhc3NSZXFUb0NhbGxiYWNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGFzeW5jIChcclxuICAgICAgICAgICAgICAgICAgICByZXE6IGV4cHJlc3MuUmVxdWVzdCxcclxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZTogKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYW55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyPzogVXNlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz86IElWZXJpZnlPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICkgPT4gdm9pZCxcclxuICAgICAgICAgICAgICAgICkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmU6IHsgdXNlcm5hbWU6IHVzZXJuYW1lIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF1c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIOyLnOuPhCDtmp/siJgg7Kad6rCAXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXEuY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShudWxsLCBudWxsLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BsZWFzZSBjaGVjayB5b3VyIGFjY291bnQgaW5mb3JtYXRpb24gYW5kIHRyeSBhZ2Fpbi4gTm90IGV4aXN0cyBlbWFpbCBpbiBvdXIgc3lzdGVtLicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXIucGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2ZlclVzZXI6IFVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZXJlOiB7IGlkOiB1c2VyLmlkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndXNlcm5hbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGlzcGxheU5hbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZW1haWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGhvdG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShudWxsLCB0cmFuc2ZlclVzZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyDsi5zrj4Qg7Zqf7IiYIOymneqwgFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUobnVsbCwgbnVsbCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgY2hlY2sgeW91ciBhY2NvdW50IGluZm8gYW5kIHRyeSBhZ2Fpbi4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplSnd0KCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIC4uLmp3dE9wdGlvbnMsXHJcbiAgICAgICAgICAgIGp3dEZyb21SZXF1ZXN0OiBFeHRyYWN0Snd0LmZyb21BdXRoSGVhZGVyQXNCZWFyZXJUb2tlbigpLFxyXG4gICAgICAgICAgICBzZWNyZXRPcktleTogand0T3B0aW9ucy5zZWNyZXQsXHJcbiAgICAgICAgICAgIHBhc3NSZXFUb0NhbGxiYWNrOiB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gbmV3IEp3dFN0cmF0ZWd5KFxyXG4gICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICBhc3luYyAoXHJcbiAgICAgICAgICAgICAgICByZXE6IGV4cHJlc3MuUmVxdWVzdCxcclxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IGFueSxcclxuICAgICAgICAgICAgICAgIGRvbmU6IChcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYW55LFxyXG4gICAgICAgICAgICAgICAgICAgIHVzZXI/OiBhbnksXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz86IElWZXJpZnlPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgKSA9PiB2b2lkLFxyXG4gICAgICAgICAgICApID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyB1c2VybmFtZSB9ID0gcGF5bG9hZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVXNlci5maW5kT25lKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogWydpZCcsICd1c2VybmFtZScsICdlbWFpbCcsICdkaXNwbGF5TmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCh1c2VyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb3VsZCBub3QgZmluZCBhIGFjY291bnQgaW5mb3JtYXRpb24uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcS51c2VyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcS51c2VySW5mbyA9IHVzZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZShudWxsLCB1c2VyLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKGVyciwgbnVsbCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZShlLCBudWxsLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcGFzc3BvcnQudXNlKHN0cmF0ZWd5KTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgTW9kZWwsXHJcbiAgICBUYWJsZSxcclxuICAgIENvbHVtbixcclxuICAgIERhdGFUeXBlLFxyXG4gICAgQWxsb3dOdWxsLFxyXG59IGZyb20gJ3NlcXVlbGl6ZS10eXBlc2NyaXB0JztcclxuXHJcbkBUYWJsZSh7XHJcbiAgICBtb2RlbE5hbWU6ICdTZXNzaW9uJyxcclxuICAgIHRhYmxlTmFtZTogJ1Nlc3Npb25zJyxcclxuICAgIHRpbWVzdGFtcHM6IHRydWUsXHJcbiAgICBjaGFyc2V0OiAndXRmOG1iNCcsXHJcbiAgICBjb2xsYXRlOiAndXRmOG1iNF9nZW5lcmFsX2NpJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIFNlc3Npb24gZXh0ZW5kcyBNb2RlbDxTZXNzaW9uPiB7XHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5TVFJJTkcoMTAwMCkpXHJcbiAgICBwdWJsaWMgc2lkITogc3RyaW5nO1xyXG5cclxuICAgIEBBbGxvd051bGwoZmFsc2UpXHJcbiAgICBAQ29sdW1uKERhdGFUeXBlLlRFWFQpXHJcbiAgICBwdWJsaWMgc2VzcyE6IHN0cmluZztcclxuXHJcbiAgICBAQWxsb3dOdWxsKGZhbHNlKVxyXG4gICAgQENvbHVtbihEYXRhVHlwZS5EQVRFKVxyXG4gICAgcHVibGljIGV4cGlyZSE6IERhdGU7XHJcbn1cclxuIiwiaW1wb3J0IGV4cHJlc3NTZXNzaW9uIGZyb20gJ2V4cHJlc3Mtc2Vzc2lvbic7XHJcbmltcG9ydCBTZXF1ZWxpemUgZnJvbSAnc2VxdWVsaXplJztcclxuaW1wb3J0IHsgU2Vzc2lvbiB9IGZyb20gJy4vU2Vzc2lvbi5tb2RlbCc7XHJcbmltcG9ydCB7IElEYXRhYmFzZVNlc3Npb25TdG9yZU9wdGlvbnMgfSBmcm9tICcuLi90eXBpbmdzL0lEYXRhYmFzZVNlc3Npb25TdG9yZU9wdGlvbnMnO1xyXG5cclxuY29uc3QgT3AgPSBTZXF1ZWxpemUuT3A7XHJcblxyXG4vKipcclxuICogU2VxdWVsaXplIOulvCDsgqzsmqntlZjripQg7IS47IWYIOyggOyepeyGjFxyXG4gKiAhISBSZXF1aXJlKCdzZXF1ZWxpemUnKVxyXG4gKiBodHRwOi8vZG9jcy5zZXF1ZWxpemVqcy5jb20vXHJcbiAqIGBgYFxyXG4gKiAkIG5wbSBpIHNlcXVlbGl6ZSAtLXNhdmVcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhYmFzZVNlc3Npb25TdG9yZSBleHRlbmRzIGV4cHJlc3NTZXNzaW9uLlN0b3JlIHtcclxuICAgIHByaXZhdGUgb3B0aW9uczogSURhdGFiYXNlU2Vzc2lvblN0b3JlT3B0aW9ucztcclxuICAgIHByaXZhdGUgY2xlYXJFeHBpcmVkU2Vzc2lvbnNJbnRlcnZhbDogTm9kZUpTLlRpbWVvdXQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBJRGF0YWJhc2VTZXNzaW9uU3RvcmVPcHRpb25zKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZXhwaXJhdGlvbjpcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5leHBpcmF0aW9uIHx8IDEwMDAgKiA2MCAqIDYwICogMjQgKiAxMjAgLyoqIDEyMCBkYXlzICovLFxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsOlxyXG4gICAgICAgICAgICAgICAgY29uZmlnLmNsZWFySW50ZXJ2YWwgfHwgMTAwMCAqIDYwICogMzAgLyoqIDMwIG1pbnV0ZXMgKi8sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLnN0YXJ0Q2xlYXJFeHBpcmVkU2Vzc2lvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVzdHJveSA9IChzaWQ6IHN0cmluZywgY2FsbGJhY2s/OiAoZXJyPzogYW55KSA9PiB2b2lkKTogdm9pZCA9PiB7XHJcbiAgICAgICAgU2Vzc2lvbi5maW5kT25lKHtcclxuICAgICAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgICAgICAgIHNpZDogc2lkLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChzZXNzaW9uKSA9PiBzZXNzaW9uLmRlc3Ryb3koKSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0ID0gKFxyXG4gICAgICAgIHNpZDogc3RyaW5nLFxyXG4gICAgICAgIGNhbGxiYWNrOiAoZXJyOiBhbnksIHNlc3Npb24/OiBFeHByZXNzLlNlc3Npb25EYXRhIHwgbnVsbCkgPT4gdm9pZCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG4gICAgICAgIFNlc3Npb24uZmluZE9uZSh7IHdoZXJlOiB7IHNpZDogc2lkIH0gfSlcclxuICAgICAgICAgICAgLnRoZW4oKHNlc3Npb24pID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBleHBpcmVkID0gc2Vzc2lvbi5leHBpcmUgPiBub3c7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlcnI6IEVycm9yIHwgbnVsbCA9IGV4cGlyZWRcclxuICAgICAgICAgICAgICAgICAgICA/IG5ldyBFcnJvcignU2Vzc2lvbiB3YXMgZXhwaXJlZC4nKVxyXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlc3Npb25EYXRhOiBFeHByZXNzLlNlc3Npb25EYXRhIHwgbnVsbCA9IGV4cGlyZWRcclxuICAgICAgICAgICAgICAgICAgICA/IG51bGxcclxuICAgICAgICAgICAgICAgICAgICA6IChKU09OLnBhcnNlKHNlc3Npb24uc2VzcykgYXMgRXhwcmVzcy5TZXNzaW9uRGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zygnc2Vzc2lvbjogJywgZXhwaXJlZCA/ICdleHBpcmVkJyA6ICd2YWxpZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2Vzc2lvbkRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgc2V0ID0gKFxyXG4gICAgICAgIHNpZDogc3RyaW5nLFxyXG4gICAgICAgIHNlc3Npb246IEV4cHJlc3MuU2Vzc2lvbkRhdGEsXHJcbiAgICAgICAgY2FsbGJhY2s/OiAoZXJyPzogYW55KSA9PiB2b2lkLFxyXG4gICAgKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgICBjb25zdCBleHBpcmVNaWxpc2Vjb25kcyA9IG5vdy5zZXRNaWxsaXNlY29uZHMoXHJcbiAgICAgICAgICAgIG5vdy5nZXRNaWxsaXNlY29uZHMoKSArIHRoaXMub3B0aW9ucy5leHBpcmF0aW9uLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZXhwaXJlID0gbmV3IERhdGUoZXhwaXJlTWlsaXNlY29uZHMpO1xyXG5cclxuICAgICAgICBjb25zdCBuZXdTZXNzaW9uID0gbmV3IFNlc3Npb24oe1xyXG4gICAgICAgICAgICBzaWQ6IHNpZCxcclxuICAgICAgICAgICAgc2VzczogSlNPTi5zdHJpbmdpZnkoc2Vzc2lvbiksXHJcbiAgICAgICAgICAgIGV4cGlyZTogZXhwaXJlLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZXdTZXNzaW9uXHJcbiAgICAgICAgICAgIC5zYXZlKClcclxuICAgICAgICAgICAgLnRoZW4oKF8pID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ3Nlc3Npb24gY3JlYXRlZC4nKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgY2xlYXJFeHBpcmVkU2Vzc2lvbnMoKTogdm9pZCB7XHJcbiAgICAgICAgU2Vzc2lvbi5kZXN0cm95KHtcclxuICAgICAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgICAgICAgIGV4cGlyZToge1xyXG4gICAgICAgICAgICAgICAgICAgIFtPcC5sdGVdOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoYWZmZWN0ZWQpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYCR7YWZmZWN0ZWR9IGV4cGlyZWQgc2Vzc2lvbiBkZWxldGVkLmApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0Q2xlYXJFeHBpcmVkU2Vzc2lvbnMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jbGVhckV4cGlyZWRTZXNzaW9uc0ludGVydmFsID0gc2V0SW50ZXJ2YWwoXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMuY2xlYXJFeHBpcmVkU2Vzc2lvbnMuYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNsZWFySW50ZXJ2YWwsXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcclxuaW1wb3J0IHsgSUNvbnRyb2xsZXJCYXNlIH0gZnJvbSAnLi9JQ29udHJvbGxlckJhc2UnO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbnRyb2xsZXJCYXNlIGltcGxlbWVudHMgSUNvbnRyb2xsZXJCYXNlIHtcclxuICAgIHByb3RlY3RlZCByZWFkb25seSByb3V0ZXI6IGV4cHJlc3MuUm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVSb3V0ZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0UGF0aCgpOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGdldFJvdXRlcigpOiBleHByZXNzLlJvdXRlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm91dGVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBpbml0aWFsaXplUm91dGVzKCk6IHZvaWQ7XHJcbn1cclxuIiwiZXhwb3J0IGludGVyZmFjZSBJSHR0cFN0YXR1c0Vycm9yIHtcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbiAgICBjb2RlPzogbnVtYmVyO1xyXG4gICAgbWVzc2FnZT86IHN0cmluZztcclxuICAgIHN0YWNrPzogc3RyaW5nO1xyXG4gICAgaW5uZXI/OiBFcnJvcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEh0dHBTdGF0dXNFcnJvciBpbXBsZW1lbnRzIEVycm9yIHtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgY29kZTogbnVtYmVyO1xyXG4gICAgcHVibGljIG1lc3NhZ2U6IHN0cmluZztcclxuICAgIHB1YmxpYyBzdGFjaz86IHN0cmluZztcclxuICAgIHB1YmxpYyBpbm5lcj86IEVycm9yO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlOiBJSHR0cFN0YXR1c0Vycm9yKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gdmFsdWUubmFtZSB8fCAnSHR0cFN0YXR1c0Vycm9yJztcclxuICAgICAgICB0aGlzLmNvZGUgPSB2YWx1ZS5jb2RlIHx8IDUwMDtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSB2YWx1ZS5tZXNzYWdlIHx8ICdBbiB1bmtub3duIGVycm9yIGhhcyBvY2N1cnJlZC4nO1xyXG4gICAgICAgIHRoaXMuaW5uZXIgPSB2YWx1ZS5pbm5lciB8fCBudWxsO1xyXG4gICAgICAgIHRoaXMuc3RhY2sgPSB2YWx1ZS5pbm5lciA/IHZhbHVlLmlubmVyLnN0YWNrIDogbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBJSnNvblJlc3VsdCB9IGZyb20gJy4vSUpzb25SZXN1bHQnO1xyXG5pbXBvcnQgeyBIdHRwU3RhdHVzRXJyb3IgfSBmcm9tICcuL0h0dHBTdGF0dXNFcnJvcic7XHJcblxyXG5leHBvcnQgY2xhc3MgSnNvblJlc3VsdDxUPiBpbXBsZW1lbnRzIElKc29uUmVzdWx0PFQ+IHtcclxuICAgIHB1YmxpYyBzdGF0aWMgRW1wdHk6IEpzb25SZXN1bHQ8b2JqZWN0PiA9IEpzb25SZXN1bHQuZ2V0RW1wdHlSZXN1bHQoKTtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEVtcHR5UmVzdWx0KCk6IEpzb25SZXN1bHQ8b2JqZWN0PiB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEpzb25SZXN1bHQ8b2JqZWN0PigpO1xyXG5cclxuICAgICAgICByZXN1bHQuc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIHJlc3VsdC5kYXRhID0gbnVsbDtcclxuICAgICAgICByZXN1bHQubWVzc2FnZSA9ICcnO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RXJyb3JSZXN1bHQoXHJcbiAgICAgICAgZXJyOiBIdHRwU3RhdHVzRXJyb3IsXHJcbiAgICApOiBKc29uUmVzdWx0PEh0dHBTdGF0dXNFcnJvcj4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgSnNvblJlc3VsdCh7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBkYXRhOiBlcnIsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlIHx8IGVyci50b1N0cmluZygpLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdWNjZXNzOiBib29sZWFuO1xyXG4gICAgcHVibGljIGRhdGE/OiBUIHwgVFtdIHwgbnVsbDtcclxuICAgIHB1YmxpYyBtZXNzYWdlPzogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlPzogSUpzb25SZXN1bHQ8VD4pIHtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5zdWNjZXNzID0gdmFsdWUuc3VjY2VzcztcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gdmFsdWUuZGF0YTtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlID0gdmFsdWUubWVzc2FnZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IGRlZmF1bHRVc2VyQXR0cmlidXRlczogc3RyaW5nW10gPSBbXHJcbiAgICAnaWQnLFxyXG4gICAgJ2VtYWlsJyxcclxuICAgICd1c2VybmFtZScsXHJcbiAgICAnZGlzcGxheU5hbWUnLFxyXG4gICAgJ3Bob3RvJyxcclxuICAgICdpc0VtYWlsQ29uZmlybWVkJyxcclxuXTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmNyeXB0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvb2tpZS1wYXJzZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJkb3RlbnZcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLXNlc3Npb25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibW9yZ2FuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhc3Nwb3J0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhc3Nwb3J0LWp3dFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXNzcG9ydC1sb2NhbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzZXF1ZWxpemVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwic2VxdWVsaXplLXR5cGVzY3JpcHRcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==