"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExhaustableArray = createExhaustableArray;
const ExhaustableArray_1 = require("C:/snapshot/project/obj/models/spt/server/ExhaustableArray");
function createExhaustableArray(itemsToAddToArray, randomUtil, cloner) {
    return new ExhaustableArray_1.ExhaustableArray(itemsToAddToArray, randomUtil, cloner);
}
//# sourceMappingURL=GlobalUtils.js.map