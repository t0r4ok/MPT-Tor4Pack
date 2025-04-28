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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanillaAdjustmentControl = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ConfigServer_1 = require("C:/snapshot/project/obj/servers/ConfigServer");
const DatabaseService_1 = require("C:/snapshot/project/obj/services/DatabaseService");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const Hostility_1 = require("../Defaults/Hostility");
const ModConfig_1 = require("../Globals/ModConfig");
let VanillaAdjustmentControl = class VanillaAdjustmentControl {
    logger;
    databaseService;
    configServer;
    cloner;
    locationConfig;
    pmcConfig;
    botConfig;
    constructor(logger, databaseService, configServer, cloner) {
        this.logger = logger;
        this.databaseService = databaseService;
        this.configServer = configServer;
        this.cloner = cloner;
        this.locationConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.LOCATION);
        this.pmcConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.PMC);
        this.botConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.BOT);
    }
    disableVanillaSettings() {
        this.locationConfig.splitWaveIntoSingleSpawnsSettings.enabled = false;
        this.locationConfig.rogueLighthouseSpawnTimeSettings.enabled = false;
        this.locationConfig.addOpenZonesToAllMaps = false;
        this.locationConfig.addCustomBotWavesToMaps = false;
        this.locationConfig.enableBotTypeLimits = false;
    }
    disableNewSpawnSystem(base) {
        if (base.Id == "laboratory")
            return;
        base.NewSpawn = false;
        base.OfflineNewSpawn = false;
        base.OldSpawn = true;
        base.OfflineOldSpawn = true;
    }
    enableAllSpawnSystem(base) {
        if (base.Id == "laboratory")
            return;
        base.NewSpawn = true;
        base.OfflineNewSpawn = true;
        base.OldSpawn = true;
        base.OfflineOldSpawn = true;
    }
    adjustNewWaveSettings(base) {
        if (base.Id == "laboratory")
            return;
        if (ModConfig_1.ModConfig.config.scavConfig.waves.enableCustomFactory && base.Id.includes("factory")) {
            // Start-Stop Time for spawns
            base.BotStart = ModConfig_1.ModConfig.config.scavConfig.waves.startSpawns;
            base.BotStop = (base.EscapeTimeLimit * 60) - ModConfig_1.ModConfig.config.scavConfig.waves.stopSpawns;
            // Start-Stop wave times for active spawning
            base.BotSpawnTimeOnMin = 10;
            base.BotSpawnTimeOnMax = 30;
            // Start-Stop wave wait times between active spawning
            base.BotSpawnTimeOffMin = 240;
            base.BotSpawnTimeOffMax = 300;
            // Probably how often it checks to spawn while active spawning
            base.BotSpawnPeriodCheck = 15;
            // Bot count required to trigger a spawn
            base.BotSpawnCountStep = 3;
            base.BotLocationModifier.NonWaveSpawnBotsLimitPerPlayer = 20;
            base.BotLocationModifier.NonWaveSpawnBotsLimitPerPlayerPvE = 20;
        }
        else {
            // Start-Stop Time for spawns
            base.BotStart = ModConfig_1.ModConfig.config.scavConfig.waves.startSpawns;
            base.BotStop = (base.EscapeTimeLimit * 60) - ModConfig_1.ModConfig.config.scavConfig.waves.stopSpawns;
            // Start-Stop wave times for active spawning
            base.BotSpawnTimeOnMin = ModConfig_1.ModConfig.config.scavConfig.waves.activeTimeMin;
            base.BotSpawnTimeOnMax = ModConfig_1.ModConfig.config.scavConfig.waves.activeTimeMax;
            // Start-Stop wave wait times between active spawning
            base.BotSpawnTimeOffMin = ModConfig_1.ModConfig.config.scavConfig.waves.quietTimeMin;
            base.BotSpawnTimeOffMax = ModConfig_1.ModConfig.config.scavConfig.waves.quietTimeMax;
            // Probably how often it checks to spawn while active spawning
            base.BotSpawnPeriodCheck = ModConfig_1.ModConfig.config.scavConfig.waves.checkToSpawnTimer;
            // Bot count required to trigger a spawn
            base.BotSpawnCountStep = ModConfig_1.ModConfig.config.scavConfig.waves.pendingBotsToTrigger;
            base.BotLocationModifier.NonWaveSpawnBotsLimitPerPlayer = 20;
            base.BotLocationModifier.NonWaveSpawnBotsLimitPerPlayerPvE = 20;
        }
    }
    removeExistingWaves(base) {
        base.waves = [];
    }
    fixPMCHostility(base) {
        const hostility = base.BotLocationModifier?.AdditionalHostilitySettings;
        if (hostility) {
            for (const bot in hostility) {
                if (hostility[bot].BotRole == "pmcUSEC" || hostility[bot].BotRole == "pmcBEAR") {
                    const newHostilitySettings = this.cloner.clone(Hostility_1.newPMCHostilitySettings);
                    newHostilitySettings.BotRole = hostility[bot].BotRole;
                    hostility[bot] = newHostilitySettings;
                }
            }
        }
    }
    removeCustomPMCWaves() {
        this.pmcConfig.removeExistingPmcWaves = false;
        this.pmcConfig.customPmcWaves = {};
    }
};
exports.VanillaAdjustmentControl = VanillaAdjustmentControl;
exports.VanillaAdjustmentControl = VanillaAdjustmentControl = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseService")),
    __param(2, (0, tsyringe_1.inject)("ConfigServer")),
    __param(3, (0, tsyringe_1.inject)("PrimaryCloner")),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof DatabaseService_1.DatabaseService !== "undefined" && DatabaseService_1.DatabaseService) === "function" ? _a : Object, typeof (_b = typeof ConfigServer_1.ConfigServer !== "undefined" && ConfigServer_1.ConfigServer) === "function" ? _b : Object, Object])
], VanillaAdjustmentControl);
//# sourceMappingURL=VanillaAdjustmentControl.js.map