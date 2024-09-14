export enum Player {
	First,
	Second
}

export namespace Player {
	export const fromNumber = (num: number): Player => {
		switch (num) {
			case 0: {
				return Player.First
			}
			case 1: {
				return Player.Second
			}
			default: {
				throw "canot convert"
			}
		}
	}
}

// https://github.com/microsoft/TypeScript/issues/36336
// https://github.com/microsoft/TypeScript/issues/50460
export let last_normal_data = 0;
export enum SyncData {
	NormalData,
	GameStart,
	GameEnd
}

export namespace SyncData {
	export const fromNumber = (num: number): number => {
		switch (num) {
			case -2: {
				return last_normal_data
			}
			case -1: {
				return -1
			}
			default: {
				if (num < 0) { throw "canot convert" };
				last_normal_data = num;
				return SyncData.NormalData;
			}
		}
	}

	export const toNumber = (variant: SyncData): number => {
		switch (variant) {
			case SyncData.NormalData: {
				return last_normal_data
			}
			case SyncData.GameStart: {
				return -1
			}
			case SyncData.GameEnd: {
				return -2
			}
			default: {
				throw "canot convert"
			}
		}
	}

    export const setLastNormalData = (val: number) => {
        last_normal_data = val
    }
}