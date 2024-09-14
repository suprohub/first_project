"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncData = exports.last_normal_data = exports.Player = void 0;
var Player;
(function (Player) {
    Player[Player["First"] = 0] = "First";
    Player[Player["Second"] = 1] = "Second";
})(Player || (exports.Player = Player = {}));
(function (Player) {
    Player.fromNumber = (num) => {
        switch (num) {
            case 0: {
                return Player.First;
            }
            case 1: {
                return Player.Second;
            }
            default: {
                throw "canot convert";
            }
        }
    };
})(Player || (exports.Player = Player = {}));
// https://github.com/microsoft/TypeScript/issues/36336
// https://github.com/microsoft/TypeScript/issues/50460
exports.last_normal_data = 0;
var SyncData;
(function (SyncData) {
    SyncData[SyncData["NormalData"] = 0] = "NormalData";
    SyncData[SyncData["GameStart"] = 1] = "GameStart";
    SyncData[SyncData["GameEnd"] = 2] = "GameEnd";
})(SyncData || (exports.SyncData = SyncData = {}));
(function (SyncData) {
    SyncData.fromNumber = (num) => {
        switch (num) {
            case -2: {
                return exports.last_normal_data;
            }
            case -1: {
                return -1;
            }
            default: {
                if (num < 0) {
                    throw "canot convert";
                }
                ;
                exports.last_normal_data = num;
                return SyncData.NormalData;
            }
        }
    };
    SyncData.toNumber = (variant) => {
        switch (variant) {
            case SyncData.NormalData: {
                return exports.last_normal_data;
            }
            case SyncData.GameStart: {
                return -1;
            }
            case SyncData.GameEnd: {
                return -2;
            }
            default: {
                throw "canot convert";
            }
        }
    };
    SyncData.setLastNormalData = (val) => {
        exports.last_normal_data = val;
    };
})(SyncData || (exports.SyncData = SyncData = {}));
//# sourceMappingURL=enums.js.map