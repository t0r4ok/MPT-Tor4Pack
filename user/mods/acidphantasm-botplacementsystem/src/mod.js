"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const InstanceManager_1 = require("./InstanceManager");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const semver_1 = require("C:/snapshot/project/node_modules/semver");
const node_path_1 = __importDefault(require("node:path"));
class ABPS {
    // Create InstanceManager - Thank you Cj as per usual
    instance = new InstanceManager_1.InstanceManager();
    // PreSPTLoad
    preSptLoad(container) {
        const logger = container.resolve("WinstonLogger");
        if (!this.validSptVersion(container)) {
            logger.error(`[ABPS] This version of ABPS was not made for your version of SPT. Disabling. Requires ${this.validMinimumSptVersion(container)} or higher.`);
            return;
        }
        this.instance.preSptLoad(container, "ABPS");
        this.instance.staticRouterHooks.registerRouterHooks();
        container.afterResolution("RaidTimeAdjustmentService", (_t, result) => {
            result.adjustWaves = (mapBase, raidAdjustments) => {
                this.instance.mapSpawnControl.adjustWaves(mapBase, raidAdjustments);
            };
        }, { frequency: "Always" });
    }
    // PostDBLoad
    postDBLoad(container) {
        this.instance.postDBLoad(container);
        this.instance.mapSpawnControl.configureInitialData();
    }
    // Version Validation
    validSptVersion(container) {
        const fileSysem = container.resolve("FileSystemSync");
        const configServer = container.resolve("ConfigServer");
        const sptConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.CORE);
        const sptVersion = globalThis.G_SPTVERSION || sptConfig.sptVersion;
        const packageJsonPath = node_path_1.default.join(__dirname, "../package.json");
        const modSptVersion = fileSysem.readJson(packageJsonPath).sptVersion;
        return (0, semver_1.satisfies)(sptVersion, modSptVersion);
    }
    validMinimumSptVersion(container) {
        const fileSysem = container.resolve("FileSystemSync");
        const packageJsonPath = node_path_1.default.join(__dirname, "../package.json");
        const modSptVersion = fileSysem.readJson(packageJsonPath).sptVersion;
        return (0, semver_1.minVersion)(modSptVersion);
    }
}
exports.mod = new ABPS();
//# sourceMappingURL=mod.js.map