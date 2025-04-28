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
exports.PMCSpawnControl = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const RandomUtil_1 = require("C:/snapshot/project/obj/utils/RandomUtil");
const WeightedRandomHelper_1 = require("C:/snapshot/project/obj/helpers/WeightedRandomHelper");
// Default PMC Data
const PMCs_1 = require("../Defaults/PMCs");
const ModConfig_1 = require("../Globals/ModConfig");
let PMCSpawnControl = class PMCSpawnControl {
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
        let pmcSpawnInfo = [];
        if (ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.enable) {
            pmcSpawnInfo = pmcSpawnInfo.concat(this.generateStartingPMCWaves(location));
        }
        if (ModConfig_1.ModConfig.config.pmcConfig.waves.enable) {
            pmcSpawnInfo = pmcSpawnInfo.concat(this.generatePMCWaves(location, escapeTimeLimit));
        }
        return pmcSpawnInfo;
    }
    generateStartingPMCWaves(location) {
        const startingPMCWaveInfo = [];
        const ignoreMaxBotCaps = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.ignoreMaxBotCaps;
        const minPMCCount = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].min;
        const maxPMCCount = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].max;
        const generatedPMCCount = this.randomUtil.getInt(minPMCCount, maxPMCCount);
        const groupChance = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.groupChance;
        const groupLimit = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.maxGroupCount;
        const groupMaxSize = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.maxGroupSize;
        const difficultyWeights = ModConfig_1.ModConfig.config.pmcDifficulty;
        let currentPMCCount = 0;
        let groupCount = 0;
        while (currentPMCCount < generatedPMCCount) {
            const canBeAGroup = groupCount >= groupLimit ? false : true;
            let groupSize = 0;
            const remainingSpots = generatedPMCCount - currentPMCCount;
            const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(groupChance) : false;
            if (isAGroup && canBeAGroup) {
                groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, groupMaxSize));
                groupCount++;
            }
            const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));
            bossDefaultData[0].BossEscortAmount = groupSize.toString();
            bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossZone = "";
            bossDefaultData[0].IgnoreMaxBots = ignoreMaxBotCaps;
            currentPMCCount += groupSize + 1;
            startingPMCWaveInfo.push(bossDefaultData[0]);
            //this.logger.warning(`[Starting PMC] Adding 1 spawn for ${pmcType} to ${location} | GroupSize: ${groupSize + 1}`);
        }
        //this.logger.warning(`[Starting PMCs] Map: ${location} (Time Limit: ${escapeTimeLimit}m) | Limits: ${minPMCCount}-${maxPMCCount} | Groups: ${groupCount} | TotalPMCs: ${currentPMCCount}/${generatedPMCCount}`);
        return startingPMCWaveInfo;
    }
    generatePMCWaves(location, escapeTimeLimit) {
        const pmcWaveSpawnInfo = [];
        const ignoreMaxBotCaps = ModConfig_1.ModConfig.config.pmcConfig.waves.ignoreMaxBotCaps;
        const difficultyWeights = ModConfig_1.ModConfig.config.pmcDifficulty;
        const waveMaxPMCCount = location.includes("factory") ? Math.min(2, ModConfig_1.ModConfig.config.pmcConfig.waves.maxBotsPerWave - 2) : ModConfig_1.ModConfig.config.pmcConfig.waves.maxBotsPerWave;
        const waveGroupLimit = ModConfig_1.ModConfig.config.pmcConfig.waves.maxGroupCount;
        const waveGroupSize = ModConfig_1.ModConfig.config.pmcConfig.waves.maxGroupSize;
        const waveGroupChance = ModConfig_1.ModConfig.config.pmcConfig.waves.groupChance;
        const firstWaveTimer = ModConfig_1.ModConfig.config.pmcConfig.waves.delayBeforeFirstWave;
        const waveTimer = ModConfig_1.ModConfig.config.pmcConfig.waves.secondsBetweenWaves;
        const endWavesAtRemainingTime = ModConfig_1.ModConfig.config.pmcConfig.waves.stopWavesBeforeEndOfRaidLimit;
        const waveCount = Math.floor((((escapeTimeLimit * 60) - endWavesAtRemainingTime) - firstWaveTimer) / waveTimer);
        let currentWaveTime = firstWaveTimer;
        //this.logger.warning(`[PMC Waves] Generating ${waveCount} waves for PMCs`)
        for (let i = 1; i <= waveCount; i++) {
            let currentPMCCount = 0;
            let groupCount = 0;
            while (currentPMCCount < waveMaxPMCCount) {
                const canBeAGroup = groupCount >= waveGroupLimit ? false : true;
                let groupSize = 0;
                const remainingSpots = waveMaxPMCCount - currentPMCCount;
                const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(waveGroupChance) : false;
                if (isAGroup && canBeAGroup) {
                    groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, waveGroupSize));
                    groupCount++;
                }
                const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
                const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));
                bossDefaultData[0].BossEscortAmount = groupSize.toString();
                bossDefaultData[0].Time = currentWaveTime;
                bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
                bossDefaultData[0].BossZone = "";
                bossDefaultData[0].IgnoreMaxBots = ignoreMaxBotCaps;
                currentPMCCount += groupSize + 1;
                pmcWaveSpawnInfo.push(bossDefaultData[0]);
                //this.logger.warning(`[PMC Waves] Adding 1 spawn for ${pmcType} to ${location} | GroupSize: ${groupSize + 1}`);
            }
            //this.logger.warning(`[PMC Waves] Wave: ${i} | Time: ${currentWaveTime} | Groups: ${groupCount} | TotalPMCs: ${currentPMCCount}/${waveMaxPMCCount}`);
            currentWaveTime += waveTimer;
        }
        return pmcWaveSpawnInfo;
    }
    getDefaultValuesForBoss(boss) {
        switch (boss) {
            case "pmcUSEC":
                return PMCs_1.pmcUSECData;
            case "pmcBEAR":
                return PMCs_1.pmcBEARData;
            default:
                this.logger.error(`[ABPS] PMC not found in config ${boss}`);
                return undefined;
        }
    }
    generateScavRaidRemainingPMCs(location, remainingRaidTime) {
        const startingPMCWaveInfo = [];
        const ignoreMaxBotCaps = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.ignoreMaxBotCaps;
        const minPMCCount = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].min;
        const maxPMCCount = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.mapLimits[location].max;
        let generatedPMCCount = this.randomUtil.getInt(minPMCCount, maxPMCCount);
        const groupChance = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.groupChance;
        const groupLimit = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.maxGroupCount;
        const groupMaxSize = ModConfig_1.ModConfig.config.pmcConfig.startingPMCs.maxGroupSize;
        const difficultyWeights = ModConfig_1.ModConfig.config.pmcDifficulty;
        let currentPMCCount = 0;
        let groupCount = 0;
        if (remainingRaidTime < 600)
            generatedPMCCount = this.randomUtil.getInt(1, 3);
        if (remainingRaidTime < 1200)
            generatedPMCCount = this.randomUtil.getInt(1, 6);
        if (remainingRaidTime < 1800)
            generatedPMCCount = this.randomUtil.getInt(4, 9);
        if (location.includes("factory") && generatedPMCCount > 5)
            generatedPMCCount -= 2;
        while (currentPMCCount < generatedPMCCount) {
            const canBeAGroup = groupCount >= groupLimit ? false : true;
            let groupSize = 0;
            const remainingSpots = generatedPMCCount - currentPMCCount;
            const isAGroup = remainingSpots > 1 ? this.randomUtil.getChance100(groupChance) : false;
            if (isAGroup && canBeAGroup) {
                groupSize = Math.min(remainingSpots - 1, this.randomUtil.getInt(1, groupMaxSize));
                groupCount++;
            }
            const pmcType = this.randomUtil.getChance100(50) ? "pmcUSEC" : "pmcBEAR";
            const bossDefaultData = this.cloner.clone(this.getDefaultValuesForBoss(pmcType));
            bossDefaultData[0].BossEscortAmount = groupSize.toString();
            bossDefaultData[0].BossDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossEscortDifficult = this.weightedRandomHelper.getWeightedValue(difficultyWeights);
            bossDefaultData[0].BossZone = "";
            bossDefaultData[0].IgnoreMaxBots = ignoreMaxBotCaps;
            currentPMCCount += groupSize + 1;
            startingPMCWaveInfo.push(bossDefaultData[0]);
            //this.logger.warning(`[Starting PMC] Adding 1 spawn for ${pmcType} to ${location} | GroupSize: ${groupSize + 1}`);
        }
        //this.logger.warning(`[Starting PMCs] Map: ${location} (Time Limit: ${escapeTimeLimit}m) | Limits: ${minPMCCount}-${maxPMCCount} | Groups: ${groupCount} | TotalPMCs: ${currentPMCCount}/${generatedPMCCount}`);
        return startingPMCWaveInfo;
    }
};
exports.PMCSpawnControl = PMCSpawnControl;
exports.PMCSpawnControl = PMCSpawnControl = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("RandomUtil")),
    __param(2, (0, tsyringe_1.inject)("PrimaryCloner")),
    __param(3, (0, tsyringe_1.inject)("WeightedRandomHelper")),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof RandomUtil_1.RandomUtil !== "undefined" && RandomUtil_1.RandomUtil) === "function" ? _a : Object, Object, typeof (_b = typeof WeightedRandomHelper_1.WeightedRandomHelper !== "undefined" && WeightedRandomHelper_1.WeightedRandomHelper) === "function" ? _b : Object])
], PMCSpawnControl);
//# sourceMappingURL=PMCSpawnControl.js.map