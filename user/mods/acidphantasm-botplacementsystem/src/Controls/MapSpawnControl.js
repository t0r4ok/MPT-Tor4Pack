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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapSpawnControl = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const BossSpawnControl_1 = require("./BossSpawnControl");
const DatabaseService_1 = require("C:/snapshot/project/obj/services/DatabaseService");
const VanillaAdjustmentControl_1 = require("./VanillaAdjustmentControl");
const PMCSpawnControl_1 = require("./PMCSpawnControl");
const ScavSpawnControl_1 = require("./ScavSpawnControl");
const ModConfig_1 = require("../Globals/ModConfig");
let MapSpawnControl = class MapSpawnControl {
    logger;
    databaseService;
    bossSpawnControl;
    scavSpawnControl;
    pmcSpawnControl;
    cloner;
    vanillaAdjustmentControl;
    validMaps = [
        "bigmap",
        "factory4_day",
        "factory4_night",
        "interchange",
        "laboratory",
        "lighthouse",
        "rezervbase",
        "sandbox",
        "sandbox_high",
        "shoreline",
        "tarkovstreets",
        "woods"
    ];
    botMapCache = {};
    scavMapCache = {};
    locationData = {};
    constructor(logger, databaseService, bossSpawnControl, scavSpawnControl, pmcSpawnControl, cloner, vanillaAdjustmentControl) {
        this.logger = logger;
        this.databaseService = databaseService;
        this.bossSpawnControl = bossSpawnControl;
        this.scavSpawnControl = scavSpawnControl;
        this.pmcSpawnControl = pmcSpawnControl;
        this.cloner = cloner;
        this.vanillaAdjustmentControl = vanillaAdjustmentControl;
    }
    configureInitialData() {
        this.locationData = this.databaseService.getTables().locations;
        for (const map in this.validMaps) {
            const mapName = this.validMaps[map];
            this.locationData[mapName].base.BossLocationSpawn = [];
            this.botMapCache[mapName] = [];
            this.scavMapCache[mapName] = [];
            if (ModConfig_1.ModConfig.config.scavConfig.waves.enable)
                this.vanillaAdjustmentControl.enableAllSpawnSystem(this.locationData[mapName].base);
            this.vanillaAdjustmentControl.removeExistingWaves(this.locationData[mapName].base);
            this.vanillaAdjustmentControl.fixPMCHostility(this.locationData[mapName].base);
            this.vanillaAdjustmentControl.adjustNewWaveSettings(this.locationData[mapName].base);
            /*
            This is how you make a spawn point properly
            if (this.validMaps[map] == "bigmap") {
                const test = {
                    "BotZoneName": "",
                    "Categories": [
                        "Player"
                    ],
                    "ColliderParams": {
                        "_parent": "SpawnSphereParams",
                        "_props": {
                            "Center": {
                                "x": 0,
                                "y": 0,
                                "z": 0
                            },
                            "Radius": 75
                        }
                    },
                    "CorePointId": 0,
                    "DelayToCanSpawnSec": 4,
                    "Id": crypto.randomUUID(),
                    "Infiltration": "Boiler Tanks",
                    "Position": {
                        "x": 288.068,
                        "y": 1.718,
                        "z": -200.166
                    },
                    "Rotation": 17.73762,
                    "Sides": [
                        "Pmc"
                    ]
                }
                this.locationData[mapName].base.SpawnPointParams.push(test);
            }
            */
        }
        this.vanillaAdjustmentControl.disableVanillaSettings();
        this.vanillaAdjustmentControl.removeCustomPMCWaves();
        this.buildInitialCache();
    }
    buildInitialCache() {
        this.buildBossWaves();
        this.buildPMCWaves();
        this.buildStartingScavs();
        this.replaceOriginalLocations();
    }
    buildBossWaves() {
        for (const map in this.validMaps) {
            const mapName = this.validMaps[map];
            const mapData = this.bossSpawnControl.getCustomMapData(this.validMaps[map], this.locationData[mapName].base.EscapeTimeLimit);
            if (mapData.length)
                mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
        }
    }
    buildPMCWaves() {
        for (const map in this.validMaps) {
            const mapName = this.validMaps[map];
            const mapData = this.pmcSpawnControl.getCustomMapData(this.validMaps[map], this.locationData[mapName].base.EscapeTimeLimit);
            if (mapData.length)
                mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
        }
    }
    buildStartingScavs() {
        for (const map in this.validMaps) {
            const mapName = this.validMaps[map];
            if (mapName == "laboratory")
                continue;
            const mapData = this.scavSpawnControl.getCustomMapData(this.validMaps[map]);
            if (mapData.length)
                mapData.forEach((index) => (this.scavMapCache[mapName].push(index)));
        }
    }
    replaceOriginalLocations() {
        for (const map in this.validMaps) {
            const mapName = this.validMaps[map];
            this.locationData[mapName].base.BossLocationSpawn = this.cloner.clone(this.botMapCache[mapName]);
            this.locationData[mapName].base.waves = this.cloner.clone(this.scavMapCache[mapName]);
        }
    }
    rebuildCache(location) {
        location = location.toLowerCase();
        this.locationData = this.databaseService.getTables().locations;
        this.botMapCache[location] = [];
        this.scavMapCache[location] = [];
        this.rebuildBossWave(location);
        this.rebuildPMCWave(location);
        this.rebuildStartingScavs(location);
        this.rebuildLocation(location);
    }
    rebuildBossWave(location) {
        const mapName = location.toLowerCase();
        this.logger.warning(`[ABPS] Recreating bosses for ${mapName}`);
        const mapData = this.bossSpawnControl.getCustomMapData(mapName, this.locationData[mapName].base.EscapeTimeLimit);
        if (mapData.length)
            mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
    }
    rebuildPMCWave(location) {
        const mapName = location.toLowerCase();
        this.logger.warning(`[ABPS] Recreating PMCs for ${mapName}`);
        const mapData = this.pmcSpawnControl.getCustomMapData(mapName, this.locationData[mapName].base.EscapeTimeLimit);
        if (mapData.length)
            mapData.forEach((index) => (this.botMapCache[mapName].push(index)));
    }
    rebuildStartingScavs(location) {
        const mapName = location.toLowerCase();
        if (mapName == "laboratory")
            return;
        this.logger.warning(`[ABPS] Recreating scavs for ${mapName}`);
        const mapData = this.scavSpawnControl.getCustomMapData(mapName);
        if (mapData.length)
            mapData.forEach((index) => (this.scavMapCache[mapName].push(index)));
    }
    rebuildLocation(location) {
        const mapName = location.toLowerCase();
        this.locationData[mapName].base.BossLocationSpawn = this.cloner.clone(this.botMapCache[mapName]);
        this.locationData[mapName].base.waves = this.cloner.clone(this.scavMapCache[mapName]);
    }
    adjustWaves(mapBase, raidAdjustments) {
        const locationName = mapBase.Id.toLowerCase();
        if (raidAdjustments.simulatedRaidStartSeconds > 60) {
            const mapBosses = mapBase.BossLocationSpawn.filter((x) => x.Time == -1 && x.BossName != "pmcUSEC" && x.BossName != "pmcBEAR");
            mapBase.BossLocationSpawn = mapBase.BossLocationSpawn.filter((x) => x.Time > raidAdjustments.simulatedRaidStartSeconds && (x.BossName == "pmcUSEC" || x.BossName == "pmcBEAR"));
            for (const bossWave of mapBase.BossLocationSpawn) {
                bossWave.Time -= Math.max(raidAdjustments.simulatedRaidStartSeconds, 0);
            }
            const totalRemainingTime = raidAdjustments.raidTimeMinutes * 60;
            const newStartingPMCs = this.pmcSpawnControl.generateScavRaidRemainingPMCs(locationName, totalRemainingTime);
            newStartingPMCs.forEach((index) => (mapBase.BossLocationSpawn.push(index)));
            mapBosses.forEach((index) => (mapBase.BossLocationSpawn.push(index)));
            const newStartingScavs = this.scavSpawnControl.generateStartingScavs(locationName, "assault", true);
            newStartingScavs.forEach((index) => (mapBase.waves.push(index)));
        }
    }
};
exports.MapSpawnControl = MapSpawnControl;
exports.MapSpawnControl = MapSpawnControl = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseService")),
    __param(2, (0, tsyringe_1.inject)("BossSpawnControl")),
    __param(3, (0, tsyringe_1.inject)("ScavSpawnControl")),
    __param(4, (0, tsyringe_1.inject)("PMCSpawnControl")),
    __param(5, (0, tsyringe_1.inject)("PrimaryCloner")),
    __param(6, (0, tsyringe_1.inject)("VanillaAdjustmentControl")),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof DatabaseService_1.DatabaseService !== "undefined" && DatabaseService_1.DatabaseService) === "function" ? _a : Object, typeof (_b = typeof BossSpawnControl_1.BossSpawnControl !== "undefined" && BossSpawnControl_1.BossSpawnControl) === "function" ? _b : Object, typeof (_c = typeof ScavSpawnControl_1.ScavSpawnControl !== "undefined" && ScavSpawnControl_1.ScavSpawnControl) === "function" ? _c : Object, typeof (_d = typeof PMCSpawnControl_1.PMCSpawnControl !== "undefined" && PMCSpawnControl_1.PMCSpawnControl) === "function" ? _d : Object, Object, typeof (_e = typeof VanillaAdjustmentControl_1.VanillaAdjustmentControl !== "undefined" && VanillaAdjustmentControl_1.VanillaAdjustmentControl) === "function" ? _e : Object])
], MapSpawnControl);
//# sourceMappingURL=MapSpawnControl.js.map