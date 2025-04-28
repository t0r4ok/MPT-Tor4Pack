"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceManager = void 0;
// SPT
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
// Custom
const ModConfig_1 = require("./Globals/ModConfig");
const MapSpawnControl_1 = require("./Controls/MapSpawnControl");
const BossSpawnControl_1 = require("./Controls/BossSpawnControl");
const VanillaAdjustmentControl_1 = require("./Controls/VanillaAdjustmentControl");
const PMCSpawnControl_1 = require("./Controls/PMCSpawnControl");
const StaticRouterHooks_1 = require("./Routers/StaticRouterHooks");
const ScavSpawnControl_1 = require("./Controls/ScavSpawnControl");
class InstanceManager {
    //#region accessible in or after preSptLoad
    modName;
    container;
    preSptModLoader;
    logger;
    fileSystemSync;
    cloner;
    staticRouterModService;
    staticRouterHooks;
    modConfig;
    //#endregion
    //#region accessible in or after postDBLoad
    databaseService;
    weightedRandomHelper;
    vanillaAdjustmentControl;
    bossSpawnControl;
    pmcSpawnControl;
    scavSpawnControl;
    mapSpawnControl;
    //#endregion
    //#region accessible in or after PostSptLoad
    //#endregion
    // Call at the start of the mods postDBLoad method
    preSptLoad(container, mod) {
        this.modName = mod;
        this.container = container;
        // SPT Classes
        this.preSptModLoader = container.resolve("PreSptModLoader");
        this.logger = container.resolve("WinstonLogger");
        this.fileSystemSync = container.resolve("FileSystemSync");
        this.cloner = container.resolve("PrimaryCloner");
        this.staticRouterModService = container.resolve("StaticRouterModService");
        // Custom Classes
        this.container.register("VanillaAdjustmentControl", VanillaAdjustmentControl_1.VanillaAdjustmentControl, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        this.container.register("BossSpawnControl", BossSpawnControl_1.BossSpawnControl, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        this.container.register("ScavSpawnControl", ScavSpawnControl_1.ScavSpawnControl, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        this.container.register("PMCSpawnControl", PMCSpawnControl_1.PMCSpawnControl, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        this.container.register("MapSpawnControl", MapSpawnControl_1.MapSpawnControl, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        this.container.register("StaticRouterHooks", StaticRouterHooks_1.StaticRouterHooks, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        this.staticRouterHooks = container.resolve("StaticRouterHooks");
        // Custom Special
        // Resolve this last to set mod configs
        this.container.register("ModConfig", ModConfig_1.ModConfig, { lifecycle: tsyringe_1.Lifecycle.Singleton });
        this.modConfig = container.resolve("ModConfig");
    }
    postDBLoad(container) {
        // SPT Classes
        this.databaseService = container.resolve("DatabaseService");
        this.weightedRandomHelper = container.resolve("WeightedRandomHelper");
        this.vanillaAdjustmentControl = container.resolve("VanillaAdjustmentControl");
        this.bossSpawnControl = container.resolve("BossSpawnControl");
        this.scavSpawnControl = container.resolve("ScavSpawnControl");
        this.pmcSpawnControl = container.resolve("PMCSpawnControl");
        this.mapSpawnControl = container.resolve("MapSpawnControl");
    }
    postSptLoad(container) {
        // SPT Classes
        this.databaseService = container.resolve("DatabaseService");
    }
}
exports.InstanceManager = InstanceManager;
//# sourceMappingURL=InstanceManager.js.map