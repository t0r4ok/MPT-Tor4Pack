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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ModConfig_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModConfig = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const node_path_1 = __importDefault(require("node:path"));
let ModConfig = class ModConfig {
    static { ModConfig_1 = this; }
    logger;
    fileSystemSync;
    static config;
    lol;
    constructor(logger, fileSystemSync) {
        this.logger = logger;
        this.fileSystemSync = fileSystemSync;
        ModConfig_1.config = this.fileSystemSync.readJson(node_path_1.default.resolve(__dirname, "../../config/config.json"));
    }
};
exports.ModConfig = ModConfig;
exports.ModConfig = ModConfig = ModConfig_1 = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("PrimaryLogger")),
    __param(1, (0, tsyringe_1.inject)("FileSystemSync")),
    __metadata("design:paramtypes", [Object, Object])
], ModConfig);
//# sourceMappingURL=ModConfig.js.map