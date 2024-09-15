export var Player;
(function (Player) {
    Player[Player["First"] = 0] = "First";
    Player[Player["Second"] = 1] = "Second";
})(Player || (Player = {}));
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
})(Player || (Player = {}));
// https://github.com/microsoft/TypeScript/issues/36336
// https://github.com/microsoft/TypeScript/issues/50460
export let last_normal_data = 0;
export var SyncData;
(function (SyncData) {
    SyncData[SyncData["NormalData"] = 0] = "NormalData";
    SyncData[SyncData["GameStart"] = 1] = "GameStart";
    SyncData[SyncData["GameEnd"] = 2] = "GameEnd";
})(SyncData || (SyncData = {}));
(function (SyncData) {
    SyncData.fromString = (str) => {
        let splitted = str.split(" ", 2);
        switch (splitted[0]) {
            case "-2": {
                last_normal_data = Number(splitted[1]);
                return SyncData.GameEnd;
            }
            case "-1": {
                return SyncData.GameStart;
            }
            default: {
                if (Number(splitted[0]) < 0) {
                    throw "canot convert";
                }
                ;
                last_normal_data = Number(splitted[0]);
                return SyncData.NormalData;
            }
        }
    };
    SyncData.fromNumber = (num) => {
        switch (num) {
            case -2: {
                return SyncData.GameEnd;
            }
            case -1: {
                return SyncData.GameStart;
            }
            default: {
                if (num < 0) {
                    throw "canot convert";
                }
                ;
                last_normal_data = num;
                return SyncData.NormalData;
            }
        }
    };
    SyncData.toString = (variant) => {
        switch (variant) {
            case SyncData.NormalData: {
                return String(last_normal_data);
            }
            case SyncData.GameStart: {
                return String(-1);
            }
            case SyncData.GameEnd: {
                return `-2 ${last_normal_data}`;
            }
            default: {
                throw "canot convert";
            }
        }
    };
    SyncData.setLastNormalData = (val) => {
        last_normal_data = val;
    };
})(SyncData || (SyncData = {}));
//# sourceMappingURL=enums.js.map