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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScavSpawnControl = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILocationBase_1 = require("C:/snapshot/project/obj/models/eft/common/ILocationBase");
const RandomUtil_1 = require("C:/snapshot/project/obj/utils/RandomUtil");
const WeightedRandomHelper_1 = require("C:/snapshot/project/obj/helpers/WeightedRandomHelper");
// Default Scav Data
const ModConfig_1 = require("../Globals/ModConfig");
const Scavs_1 = require("../Defaults/Scavs");
const DatabaseService_1 = require("C:/snapshot/project/obj/services/DatabaseService");
const MapSpawnZones_1 = require("../Defaults/MapSpawnZones");
const GlobalUtils_1 = require("../Utils/GlobalUtils");
let ScavSpawnControl = class ScavSpawnControl {
    logger;
    databaseService;
    randomUtil;
    cloner;
    weightedRandomHelper;
    constructor(logger, databaseService, randomUtil, cloner, weightedRandomHelper) {
        this.logger = logger;
        this.databaseService = databaseService;
        this.randomUtil = randomUtil;
        this.cloner = cloner;
        this.weightedRandomHelper = weightedRandomHelper;
    }
    getCustomMapData(location) {
        return this.getConfigValueForLocation(location);
    }
    getConfigValueForLocation(location) {
        const scavSpawnInfo = [];
        if (ModConfig_1.ModConfig.config.scavConfig.startingScavs.enable)
            scavSpawnInfo.push(...this.generateStartingScavs(location));
        if (ModConfig_1.ModConfig.config.scavConfig.startingScavs.startingMarksman) {
            const marksmanSpawn = this.generateStartingScavs(location, "marksman");
            if (marksmanSpawn.length) {
                scavSpawnInfo.push(...marksmanSpawn);
            }
        }
        return scavSpawnInfo;
    }
    generateStartingScavs(location, botRole = "assault", lateStart = false) {
        const scavWaveSpawnInfo = [];
        const waveLength = this.databaseService.getTables().locations[location].base.waves.length;
        const maxStartingSpawns = ModConfig_1.ModConfig.config.scavConfig.startingScavs.maxBotSpawns[location];
        const scavCap = lateStart ? maxStartingSpawns * 0.75 : maxStartingSpawns;
        const playerScavChance = lateStart ? 60 : 10;
        const maxBotsPerZone = location.includes("factory") || location.includes("sandbox") ? maxStartingSpawns : ModConfig_1.ModConfig.config.scavConfig.startingScavs.maxBotsPerZone;
        const availableSpawnZones = botRole == "assault" ? (0, GlobalUtils_1.createExhaustableArray)(this.getNonMarksmanSpawnZones(location), this.randomUtil, this.cloner) : (0, GlobalUtils_1.createExhaustableArray)(this.getMarksmanSpawnZones(location), this.randomUtil, this.cloner);
        let spawnsAdded = botRole == "assault" ? 0 : waveLength;
        let marksmanCount = 0;
        while (spawnsAdded < scavCap) {
            if (spawnsAdded >= maxStartingSpawns)
                break;
            const scavDefaultData = this.cloner.clone(this.getDefaultValues());
            let selectedSpawnZone = location.includes("factory") || location.includes("sandbox") || !availableSpawnZones.hasValues() ? "" : availableSpawnZones.getRandomValue();
            if (botRole != "assault") {
                if (!availableSpawnZones.hasValues())
                    break;
                if (selectedSpawnZone == undefined)
                    break;
                if (marksmanCount >= 2)
                    break;
                selectedSpawnZone = availableSpawnZones.getRandomValue();
                marksmanCount++;
            }
            const remainingSpots = maxStartingSpawns - spawnsAdded;
            const groupSize = botRole == "assault" ? Math.min(remainingSpots - 1, this.randomUtil.getInt(1, maxBotsPerZone)) : 1;
            scavDefaultData.slots_min = groupSize > 1 ? 1 : 0;
            scavDefaultData.slots_max = groupSize > 1 ? groupSize : 1;
            scavDefaultData.time_min = 1;
            scavDefaultData.time_max = 3;
            scavDefaultData.number = spawnsAdded;
            scavDefaultData.WildSpawnType = botRole == "assault" ? ILocationBase_1.WildSpawnType.ASSAULT : ILocationBase_1.WildSpawnType.MARKSMAN;
            scavDefaultData.isPlayers = botRole == "assault" ? this.randomUtil.getChance100(playerScavChance) ? true : false : false;
            scavDefaultData.SpawnPoints = selectedSpawnZone;
            spawnsAdded++;
            scavWaveSpawnInfo.push(scavDefaultData);
            //this.logger.warning(`[Scav Waves] ${scavDefaultData.number} - Adding 1 spawn for ${botRole} to ${location} | Zone: ${selectedSpawnZone} Min: ${scavDefaultData.slots_min} | Max: ${scavDefaultData.slots_max}`);
        }
        return scavWaveSpawnInfo;
    }
    getDefaultValues() {
        return Scavs_1.scavData;
    }
    getNonMarksmanSpawnZones(location) {
        switch (location) {
            case "bigmap":
                return MapSpawnZones_1.Customs_SpawnZones;
            case "factory4_day":
            case "factory4_night":
                return MapSpawnZones_1.Factory_SpawnZones;
            case "interchange":
                return MapSpawnZones_1.Interchange_SpawnZones;
            case "laboratory":
                return MapSpawnZones_1.Labs_NonGateSpawnZones;
            case "lighthouse":
                return MapSpawnZones_1.Lighthouse_NonWaterTreatmentSpawnZones;
            case "rezervbase":
                return MapSpawnZones_1.Reserve_SpawnZones;
            case "sandbox":
            case "sandbox_high":
                return MapSpawnZones_1.GroundZero_SpawnZones;
            case "shoreline":
                return MapSpawnZones_1.Shoreline_SpawnZones;
            case "tarkovstreets":
                return MapSpawnZones_1.Streets_SpawnZones;
            case "woods":
                return MapSpawnZones_1.Woods_SpawnZones;
        }
    }
    getMarksmanSpawnZones(location) {
        switch (location) {
            case "bigmap":
                return MapSpawnZones_1.Customs_SnipeSpawnZones;
            case "factory4_day":
            case "factory4_night":
                return undefined;
            case "interchange":
                return undefined;
            case "laboratory":
                return undefined;
            case "lighthouse":
                return MapSpawnZones_1.Lighthouse_SnipeSpawnZones;
            case "rezervbase":
                return undefined;
            case "sandbox":
            case "sandbox_high":
                return MapSpawnZones_1.GroundZero_SnipeSpawnZones;
            case "shoreline":
                return MapSpawnZones_1.Shoreline_SnipeSpawnZones;
            case "tarkovstreets":
                return MapSpawnZones_1.Streets_SnipeSpawnZones;
            case "woods":
                return MapSpawnZones_1.Woods_SnipeSpawnZones;
        }
    }
    generateInitialScavsForRemainingRaidTime(location, botRole) {
        const scavWaveSpawnInfo = [];
        const waveLength = this.databaseService.getTables().locations[location].base.waves.length;
        const maxStartingSpawns = ModConfig_1.ModConfig.config.scavConfig.startingScavs.maxBotSpawns[location] * 0.75;
        const maxBotsPerZone = location.includes("factory") || location.includes("sandbox") ? maxStartingSpawns : ModConfig_1.ModConfig.config.scavConfig.startingScavs.maxBotsPerZone;
        const checkMarksman = ModConfig_1.ModConfig.config.scavConfig.startingScavs.startingMarksman;
        const availableSpawnZones = botRole == "assault" ? (0, GlobalUtils_1.createExhaustableArray)(this.getNonMarksmanSpawnZones(location), this.randomUtil, this.cloner) : (0, GlobalUtils_1.createExhaustableArray)(this.getMarksmanSpawnZones(location), this.randomUtil, this.cloner);
        let spawnsAdded = botRole == "assault" ? 0 : waveLength;
        while (spawnsAdded < maxStartingSpawns) {
            if (spawnsAdded >= maxStartingSpawns)
                break;
            const scavDefaultData = this.cloner.clone(this.getDefaultValues());
            const selectedSpawnZone = location.includes("factory") || location.includes("sandbox") || !availableSpawnZones.hasValues() ? "" : availableSpawnZones.getRandomValue();
            const remainingSpots = maxStartingSpawns - spawnsAdded;
            const groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, maxBotsPerZone));
            scavDefaultData.slots_min = groupSize > 1 ? 1 : 1;
            scavDefaultData.slots_max = groupSize > 1 ? groupSize : 1;
            scavDefaultData.time_min = 1;
            scavDefaultData.time_max = 3;
            scavDefaultData.number = spawnsAdded;
            scavDefaultData.isPlayers = botRole == "assault" ? this.randomUtil.getChance100(60) ? true : false : false;
            scavDefaultData.SpawnPoints = selectedSpawnZone;
            spawnsAdded++;
            scavWaveSpawnInfo.push(scavDefaultData);
            //this.logger.warning(`[Scav Waves] ${scavDefaultData.number} - Adding 1 spawn for assault to ${location} | Zone: ${selectedSpawnZone} Min: ${scavDefaultData.slots_min} | Max: ${scavDefaultData.slots_max}`);
        }
        return scavWaveSpawnInfo;
    }
};
exports.ScavSpawnControl = ScavSpawnControl;
exports.ScavSpawnControl = ScavSpawnControl = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("DatabaseService")),
    __param(2, (0, tsyringe_1.inject)("RandomUtil")),
    __param(3, (0, tsyringe_1.inject)("PrimaryCloner")),
    __param(4, (0, tsyringe_1.inject)("WeightedRandomHelper")),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof DatabaseService_1.DatabaseService !== "undefined" && DatabaseService_1.DatabaseService) === "function" ? _a : Object, typeof (_b = typeof RandomUtil_1.RandomUtil !== "undefined" && RandomUtil_1.RandomUtil) === "function" ? _b : Object, Object, typeof (_c = typeof WeightedRandomHelper_1.WeightedRandomHelper !== "undefined" && WeightedRandomHelper_1.WeightedRandomHelper) === "function" ? _c : Object])
], ScavSpawnControl);
//# sourceMappingURL=ScavSpawnControl.js.map