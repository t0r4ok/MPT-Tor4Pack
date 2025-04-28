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
exports.BossSpawnControl = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const WeightedRandomHelper_1 = require("C:/snapshot/project/obj/helpers/WeightedRandomHelper");
const RandomUtil_1 = require("C:/snapshot/project/obj/utils/RandomUtil");
const ModConfig_1 = require("../Globals/ModConfig");
// Default Boss Data
const Bosses_1 = require("../Defaults/Bosses");
let BossSpawnControl = class BossSpawnControl {
    logger;
    randomUtil;
    cloner;
    weightedRandomHelper;
    constructor(logger, randomUtil, cloner, weightedRandomHelper) {
        this.logger = logger;
        this.randomUtil = randomUtil;
        this.cloner = cloner;
        this.weightedRandomHelper = weightedRandomHelper;
    }
    getCustomMapData(location, escapeTimeLimit) {
        return this.getConfigValueForLocation(location, escapeTimeLimit);
    }
    getConfigValueForLocation(location, escapeTimeLimit) {
        const bossesForMap = [];
        for (const boss in ModConfig_1.ModConfig.config.bossConfig) {
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(boss, location));
            const bossConfigData = ModConfig_1.ModConfig.config.bossConfig[boss];
            const difficultyWeights = ModConfig_1.ModConfig.config.bossDifficulty;
            if (!bossConfigData.enable)
                continue;
            if (boss == "exUsec" && !bossConfigData.disableVanillaSpawns && location == "lighthouse" || boss == "pmcBot" && !bossConfigData.disableVanillaSpawns && (location == "laboratory" || location == "rezervbase")) {
                for (const bossSpawn in bossDefaultData) {
                    // Create the vanilla spawns
                    //bossDefaultData[bossSpawn].BossChance = bossConfigData.spawnChance[location];
                    bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                    bossesForMap.push(bossDefaultData[bossSpawn]);
                }
                if (!bossConfigData.addExtraSpawns)
                    continue;
            }
            if (!bossConfigData.spawnChance[location])
                continue;
            if (location.includes("factory"))
                bossConfigData.bossZone[location] = "BotZone";
            if ((boss == "pmcBot") && bossConfigData.addExtraSpawns) {
                bossesForMap.push(...this.generateBossWaves(location, escapeTimeLimit));
                continue;
            }
            bossDefaultData[0].BossChance = bossConfigData.spawnChance[location];
            bossDefaultData[0].BossZone = bossConfigData.bossZone[location];
            bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].Time = bossConfigData.time;
            bossesForMap.push(bossDefaultData[0]);
        }
        return bossesForMap;
    }
    generateBossWaves(location, escapeTimeLimit) {
        const pmcWaveSpawnInfo = [];
        const difficultyWeights = ModConfig_1.ModConfig.config.bossDifficulty;
        const waveMaxPMCCount = location != "laboratory" ? 4 : 10;
        const waveGroupLimit = 4;
        const waveGroupSize = 2;
        const waveGroupChance = 100;
        const waveTimer = 450;
        const endWavesAtRemainingTime = 300;
        const waveCount = Math.floor((((escapeTimeLimit * 60) - endWavesAtRemainingTime)) / waveTimer);
        let currentWaveTime = waveTimer;
        const bossConfigData = ModConfig_1.ModConfig.config.bossConfig["pmcBot"];
        //this.logger.warning(`[Boss Waves] Generating ${waveCount} waves for Raiders`)
        for (let i = 1; i <= waveCount; i++) {
            if (i == 1)
                currentWaveTime = -1;
            let currentPMCCount = 0;
            let groupCount = 0;
            while (currentPMCCount < waveMaxPMCCount) {
                if (groupCount >= waveGroupLimit)
                    break;
                let groupSize = 0;
                const remainingSpots = waveMaxPMCCount - currentPMCCount;
                const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(waveGroupChance) : false;
                if (isAGroup) {
                    groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, waveGroupSize));
                }
                const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss("pmcBot", ""));
                bossDefaultData[0].BossChance = bossConfigData.spawnChance[location];
                bossDefaultData[0].BossZone = bossConfigData.bossZone[location];
                bossDefaultData[0].BossEscortAmount = groupSize.toString();
                bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].IgnoreMaxBots = false;
                bossDefaultData[0].Time = currentWaveTime;
                currentPMCCount += groupSize + 1;
                groupCount++;
                pmcWaveSpawnInfo.push(bossDefaultData[0]);
                //this.logger.warning(`[Boss Waves] Adding 1 spawn for Raiders to ${location} | GroupSize: ${groupSize + 1}`);
            }
            //this.logger.warning(`[Boss Waves] Wave: ${i} | Time: ${currentWaveTime} | Groups: ${groupCount} | TotalRaiderss: ${currentPMCCount}/${waveMaxPMCCount}`);
            currentWaveTime += waveTimer;
        }
        return pmcWaveSpawnInfo;
    }
    getDefaultValuesForBoss(boss, location) {
        switch (boss) {
            case "bossKnight":
                return Bosses_1.bossKnightData;
            case "bossBully":
                return Bosses_1.bossBullyData;
            case "bossTagilla":
                return Bosses_1.bossTagillaData;
            case "bossKilla":
                return Bosses_1.bossKillaData;
            case "bossZryachiy":
                return Bosses_1.bossZryachiyData;
            case "bossGluhar":
                return Bosses_1.bossGluharData;
            case "bossSanitar":
                return Bosses_1.bossSanitarData;
            case "bossKolontay":
                return Bosses_1.bossKolontayData;
            case "bossBoar":
                return Bosses_1.bossBoarData;
            case "bossKojaniy":
                return Bosses_1.bossKojaniyData;
            case "bossPartisan":
                return Bosses_1.bossPartisanData;
            case "sectantPriest":
                return Bosses_1.sectantPriestData;
            case "arenaFighterEvent":
                return Bosses_1.arenaFighterEventData;
            case "pmcBot": // Requires Triggers + Has Multiple Zones
                if (location == "rezervbase")
                    return Bosses_1.pmcBotReserveData;
                if (location == "laboratory")
                    return Bosses_1.pmcBotLaboratoryData;
                else
                    return Bosses_1.pmcBotData;
            case "exUsec": // Has Multiple Zones
                return Bosses_1.exUsecData;
            case "gifter":
                return Bosses_1.gifterData;
            default:
                this.logger.error(`[ABPS] Boss not found in config ${boss}`);
                return undefined;
        }
    }
};
exports.BossSpawnControl = BossSpawnControl;
exports.BossSpawnControl = BossSpawnControl = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("RandomUtil")),
    __param(2, (0, tsyringe_1.inject)("PrimaryCloner")),
    __param(3, (0, tsyringe_1.inject)("WeightedRandomHelper")),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof RandomUtil_1.RandomUtil !== "undefined" && RandomUtil_1.RandomUtil) === "function" ? _a : Object, Object, typeof (_b = typeof WeightedRandomHelper_1.WeightedRandomHelper !== "undefined" && WeightedRandomHelper_1.WeightedRandomHelper) === "function" ? _b : Object])
], BossSpawnControl);
//# sourceMappingURL=BossSpawnControl.js.map