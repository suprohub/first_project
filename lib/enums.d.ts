export declare enum Player {
    First = 0,
    Second = 1
}
export declare namespace Player {
    const fromNumber: (num: number) => Player;
}
export declare let last_normal_data: number;
export declare enum SyncData {
    NormalData = 0,
    GameStart = 1,
    GameEnd = 2
}
export declare namespace SyncData {
    const fromString: (str: string) => number;
    const fromNumber: (num: number) => number;
    const toString: (variant: SyncData) => string;
    const setLastNormalData: (val: number) => void;
}
//# sourceMappingURL=enums.d.ts.map