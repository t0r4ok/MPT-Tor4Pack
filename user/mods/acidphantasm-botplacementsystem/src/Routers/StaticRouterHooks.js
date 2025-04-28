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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticRouterHooks = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const StaticRouterModService_1 = require("C:/snapshot/project/obj/services/mod/staticRouter/StaticRouterModService");
const MapSpawnControl_1 = require("../Controls/MapSpawnControl");
const node_path_1 = __importDefault(require("node:path"));
const FileSystemSync_1 = require("C:/snapshot/project/obj/utils/FileSystemSync");
let StaticRouterHooks = class StaticRouterHooks {
    staticRouterService;
    mapSpawnControl;
    fileSystem;
    cacheRebuilt = false;
    mapToRebuild = "";
    bossTrackingData = null;
    constructor(staticRouterService, mapSpawnControl, fileSystem) {
        this.staticRouterService = staticRouterService;
        this.mapSpawnControl = mapSpawnControl;
        this.fileSystem = fileSystem;
    }
    registerRouterHooks() {
        this.staticRouterService.registerStaticRouter("ABPS-StartMatchRouter", [
            {
                url: "/client/match/local/start",
                action: async (url, info, sessionId, output) => {
                    this.mapToRebuild = info.location;
                    if (this.cacheRebuilt) {
                        this.cacheRebuilt = false;
                    }
                    return output;
                }
            }
        ], "ABPS");
        this.staticRouterService.registerStaticRouter("ABPS-EndMatchRouter", [
            {
                url: "/client/match/local/end",
                action: async (url, info, sessionId, output) => {
                    if (!this.cacheRebuilt) {
                        this.mapSpawnControl.rebuildCache(this.mapToRebuild);
                        this.cacheRebuilt = true;
                    }
                    return output;
                }
            }
        ], "ABPS");
        this.staticRouterService.registerStaticRouter("ABPS-BossTrackingRoutes", [
            {
                url: "/abps/save",
                action: async (url, info, sessionId, output) => this.saveBossTrackingData(info)
            },
            {
                url: "/abps/load",
                action: async (url, info, sessionId, output) => JSON.stringify(this.bossTrackingData)
            }
        ], "ABPS");
        this.load();
    }
    async saveBossTrackingData(payload) {
        if (!payload) {
            return;
        }
        else {
            this.bossTrackingData = payload;
        }
        await this.save();
        return JSON.stringify({ success: true });
    }
    async save() {
        try {
            const filename = node_path_1.default.join(__dirname, "../../bossTrackingData.json");
            await this.fileSystem.writeJson(filename, this.bossTrackingData, 2);
        }
        catch (error) {
            console.error("[ABPS] Failed to save boss tracking data! " + error);
        }
    }
    async load() {
        const filename = node_path_1.default.join(__dirname, "../../bossTrackingData.json");
        if (this.fileSystem.exists(filename)) {
            const jsonData = this.fileSystem.readJson(filename);
            this.bossTrackingData = jsonData;
        }
        else {
            this.bossTrackingData = {};
            await this.save();
        }
    }
};
exports.StaticRouterHooks = StaticRouterHooks;
exports.StaticRouterHooks = StaticRouterHooks = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("StaticRouterModService")),
    __param(1, (0, tsyringe_1.inject)("MapSpawnControl")),
    __param(2, (0, tsyringe_1.inject)("FileSystemSync")),
    __metadata("design:paramtypes", [typeof (_a = typeof StaticRouterModService_1.StaticRouterModService !== "undefined" && StaticRouterModService_1.StaticRouterModService) === "function" ? _a : Object, typeof (_b = typeof MapSpawnControl_1.MapSpawnControl !== "undefined" && MapSpawnControl_1.MapSpawnControl) === "function" ? _b : Object, typeof (_c = typeof FileSystemSync_1.FileSystemSync !== "undefined" && FileSystemSync_1.FileSystemSync) === "function" ? _c : Object])
], StaticRouterHooks);
//# sourceMappingURL=StaticRouterHooks.js.map