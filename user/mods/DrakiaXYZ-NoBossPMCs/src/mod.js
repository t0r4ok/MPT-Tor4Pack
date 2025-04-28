"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
class Mod {
    postDBLoad(container) {
        const configServer = container.resolve("ConfigServer");
        const pmcConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.PMC);
        const botConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.BOT);
        // Reduce PMCs to a single choice, their base brain type
        const defaultBrains = {
            "pmcbear": "pmcBEAR",
            "pmcusec": "pmcUSEC"
        };
        for (const pmcType in pmcConfig.pmcType) {
            for (const mapKey in pmcConfig.pmcType[pmcType]) {
                pmcConfig.pmcType[pmcType][mapKey] = {};
                pmcConfig.pmcType[pmcType][mapKey][defaultBrains[pmcType]] = 1;
            }
        }
        // Player scavs get to randomly choose between a BEAR, a USEC, or a scav
        const playerScavBrains = {
            "assault": 1,
            "pmcBEAR": 1,
            "pmcUSEC": 1
        };
        for (const mapKey in botConfig.playerScavBrainType) {
            botConfig.playerScavBrainType[mapKey] = playerScavBrains;
        }
    }
}
exports.mod = new Mod();
//# sourceMappingURL=mod.js.map