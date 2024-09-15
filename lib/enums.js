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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9lbnVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFZLE1BR1g7QUFIRCxXQUFZLE1BQU07SUFDakIscUNBQUssQ0FBQTtJQUNMLHVDQUFNLENBQUE7QUFDUCxDQUFDLEVBSFcsTUFBTSxzQkFBTixNQUFNLFFBR2pCO0FBRUQsV0FBaUIsTUFBTTtJQUNULGlCQUFVLEdBQUcsQ0FBQyxHQUFXLEVBQVUsRUFBRTtRQUNqRCxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNSLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQTtZQUNwQixDQUFDO1lBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNSLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQTtZQUNyQixDQUFDO1lBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDVCxNQUFNLGVBQWUsQ0FBQTtZQUN0QixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUMsQ0FBQTtBQUNGLENBQUMsRUFkZ0IsTUFBTSxzQkFBTixNQUFNLFFBY3RCO0FBRUQsdURBQXVEO0FBQ3ZELHVEQUF1RDtBQUM1QyxRQUFBLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQUNoQyxJQUFZLFFBSVg7QUFKRCxXQUFZLFFBQVE7SUFDbkIsbURBQVUsQ0FBQTtJQUNWLGlEQUFTLENBQUE7SUFDVCw2Q0FBTyxDQUFBO0FBQ1IsQ0FBQyxFQUpXLFFBQVEsd0JBQVIsUUFBUSxRQUluQjtBQUVELFdBQWlCLFFBQVE7SUFDWCxtQkFBVSxHQUFHLENBQUMsR0FBVyxFQUFVLEVBQUU7UUFDakQsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNiLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNULE9BQU8sd0JBQWdCLENBQUE7WUFDeEIsQ0FBQztZQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNULE9BQU8sQ0FBQyxDQUFDLENBQUE7WUFDVixDQUFDO1lBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDVCxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFBQyxNQUFNLGVBQWUsQ0FBQTtnQkFBQyxDQUFDO2dCQUFBLENBQUM7Z0JBQ3ZDLHdCQUFnQixHQUFHLEdBQUcsQ0FBQztnQkFDdkIsT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQzVCLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQyxDQUFBO0lBRVksaUJBQVEsR0FBRyxDQUFDLE9BQWlCLEVBQVUsRUFBRTtRQUNyRCxRQUFRLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLEtBQUssUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE9BQU8sd0JBQWdCLENBQUE7WUFDeEIsQ0FBQztZQUNELEtBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxDQUFDLENBQUE7WUFDVixDQUFDO1lBQ0QsS0FBSyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQTtZQUNWLENBQUM7WUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNULE1BQU0sZUFBZSxDQUFBO1lBQ3RCLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQyxDQUFBO0lBRWUsMEJBQWlCLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRTtRQUM3Qyx3QkFBZ0IsR0FBRyxHQUFHLENBQUE7SUFDMUIsQ0FBQyxDQUFBO0FBQ0wsQ0FBQyxFQXJDZ0IsUUFBUSx3QkFBUixRQUFRLFFBcUN4QiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFBsYXllciB7XG5cdEZpcnN0LFxuXHRTZWNvbmRcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBQbGF5ZXIge1xuXHRleHBvcnQgY29uc3QgZnJvbU51bWJlciA9IChudW06IG51bWJlcik6IFBsYXllciA9PiB7XG5cdFx0c3dpdGNoIChudW0pIHtcblx0XHRcdGNhc2UgMDoge1xuXHRcdFx0XHRyZXR1cm4gUGxheWVyLkZpcnN0XG5cdFx0XHR9XG5cdFx0XHRjYXNlIDE6IHtcblx0XHRcdFx0cmV0dXJuIFBsYXllci5TZWNvbmRcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0dGhyb3cgXCJjYW5vdCBjb252ZXJ0XCJcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8zNjMzNlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy81MDQ2MFxuZXhwb3J0IGxldCBsYXN0X25vcm1hbF9kYXRhID0gMDtcbmV4cG9ydCBlbnVtIFN5bmNEYXRhIHtcblx0Tm9ybWFsRGF0YSxcblx0R2FtZVN0YXJ0LFxuXHRHYW1lRW5kXG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgU3luY0RhdGEge1xuXHRleHBvcnQgY29uc3QgZnJvbU51bWJlciA9IChudW06IG51bWJlcik6IG51bWJlciA9PiB7XG5cdFx0c3dpdGNoIChudW0pIHtcblx0XHRcdGNhc2UgLTI6IHtcblx0XHRcdFx0cmV0dXJuIGxhc3Rfbm9ybWFsX2RhdGFcblx0XHRcdH1cblx0XHRcdGNhc2UgLTE6IHtcblx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdGlmIChudW0gPCAwKSB7IHRocm93IFwiY2Fub3QgY29udmVydFwiIH07XG5cdFx0XHRcdGxhc3Rfbm9ybWFsX2RhdGEgPSBudW07XG5cdFx0XHRcdHJldHVybiBTeW5jRGF0YS5Ob3JtYWxEYXRhO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdCB0b051bWJlciA9ICh2YXJpYW50OiBTeW5jRGF0YSk6IG51bWJlciA9PiB7XG5cdFx0c3dpdGNoICh2YXJpYW50KSB7XG5cdFx0XHRjYXNlIFN5bmNEYXRhLk5vcm1hbERhdGE6IHtcblx0XHRcdFx0cmV0dXJuIGxhc3Rfbm9ybWFsX2RhdGFcblx0XHRcdH1cblx0XHRcdGNhc2UgU3luY0RhdGEuR2FtZVN0YXJ0OiB7XG5cdFx0XHRcdHJldHVybiAtMVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBTeW5jRGF0YS5HYW1lRW5kOiB7XG5cdFx0XHRcdHJldHVybiAtMlxuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHR0aHJvdyBcImNhbm90IGNvbnZlcnRcIlxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG4gICAgZXhwb3J0IGNvbnN0IHNldExhc3ROb3JtYWxEYXRhID0gKHZhbDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGxhc3Rfbm9ybWFsX2RhdGEgPSB2YWxcbiAgICB9XG59Il19