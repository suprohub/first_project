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
	export const fromString = (str: string): number => {
		let splitted = str.split(" ", 2);
		switch (splitted[0]) {
			case "-2": {
				last_normal_data = Number(splitted[1]);
				return SyncData.GameEnd
			}
			case "-1": {
				return SyncData.GameStart
			}
			default: {
				if (Number(splitted[0]) < 0) { throw "canot convert" };
				last_normal_data = Number(splitted[0]);
				return SyncData.NormalData;
			}
		}
	}

	export const fromNumber = (num: number): number => {
		switch (num) {
			case -2: {
				return SyncData.GameEnd
			}
			case -1: {
				return SyncData.GameStart
			}
			default: {
				if (num < 0) { throw "canot convert" };
				last_normal_data = num;
				return SyncData.NormalData;
			}
		}
	}

	export const toString = (variant: SyncData): string => {
		switch (variant) {
			case SyncData.NormalData: {
				return String(last_normal_data)
			}
			case SyncData.GameStart: {
				return String(-1)
			}
			case SyncData.GameEnd: {
				return `-2 ${last_normal_data}`
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