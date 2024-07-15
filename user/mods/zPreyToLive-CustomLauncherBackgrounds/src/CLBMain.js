"use strict";
/*
 * CustomLauncherBackgrounds v1.0.1
 * MIT License
 * Copyright (c) 2024 PreyToLive
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CLBEnumLogger_1 = require("../enums/CLBEnumLogger");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const package_json_1 = __importDefault(require("../package.json"));
const config_json_1 = __importDefault(require("../config/config.json"));
class CLBMain {
    preSptModLoader;
    logger;
    imageRouter;
    postSptLoad(container) {
        this.preSptModLoader = container.resolve("PreSptModLoader");
        this.logger = container.resolve("WinstonLogger");
        this.imageRouter = container.resolve("ImageRouter");
        const modPath = path.basename(path.dirname(__dirname.split('/').pop()));
        const resFolderPath = `${this.preSptModLoader.getModPath(modPath)}res`;
        const launcherFolderName = config_json_1.default.launcherFolderToUse;
        const launcherFolderPath = path.join(resFolderPath, "launchers", launcherFolderName);
        if (config_json_1.default.modEnabled && launcherFolderName !== undefined) {
            fs.readdir(launcherFolderPath, (err, files) => {
                if (err) {
                    this.logger.error(`Mod: ${package_json_1.default.name}: Error reading directory: ${err}`);
                    return;
                }
                const randomIndex = Math.floor(Math.random() * files.length);
                const randomFile = files[randomIndex];
                const route = "/files/launcher/bg";
                const imagePath = path.join(launcherFolderPath, randomFile);
                this.imageRouter.addRoute(route, imagePath);
                if (config_json_1.default.consoleLogs) {
                    this.logger.log(`Mod: ${package_json_1.default.name}: Console Logs`, CLBEnumLogger_1.LoggerTypes.INFO);
                    this.logger.log(`${route} => ${imagePath}`, CLBEnumLogger_1.LoggerTypes.INFO);
                }
            });
        }
        else {
            this.logger.log(`Mod: ${package_json_1.default.name}: Unable to find contents for "launcherFolderToUse": ${launcherFolderPath}`, CLBEnumLogger_1.LoggerTypes.ERROR);
        }
    }
}
module.exports = { mod: new CLBMain() };
//# sourceMappingURL=CLBMain.js.map