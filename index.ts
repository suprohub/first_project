import * as http from "node:http";
import * as fs from "node:fs";
import { randomBytes } from "node:crypto";
import { Player, SyncData, last_normal_data } from "./enums";

const field_len = 20;
const table: Map<number, Player> = new Map();
const passwords: Map<Player, string> = new Map();
let server_full = false;
let player = Player.First;
let last_move = Player.First;
let current_move = Player.First;
let sync_data = SyncData.GameStart;


const check_direction_len = (
	first_cell: number,
	x_add: number,
	y_add: number,
	len: number
): number | null => {
	let values: any[] = [];
	let value: Player | undefined;
	let [x, y] = [0, 0];
	for (let i = 0; i < len; i++) {
		value = table.get(first_cell + y + x);
		values.push(value);
		y += y_add * field_len;
		x += x_add;
	}
	// Bypass null || 0
	if (values.every((value) => value == Player.First)) {
		return 1;
	}
	if (values.every((value) => value == Player.Second)) {
		return 2;
	}
	return null;
}

const check_direction = (
	first_cell: number,
	x_add: number,
	y_add: number,
): number | null => {
	const first_check = check_direction_len(first_cell, x_add, y_add, 5);
	// 0 this 0 0 0
	const special_check_left = [check_direction_len(first_cell, -x_add, -y_add, 2), check_direction_len(first_cell, x_add, y_add, 4)];
	// 0 0 this 0 0
	const special_check_center = [check_direction_len(first_cell, -x_add, -y_add, 3), check_direction_len(first_cell, x_add, y_add, 3)];
	// 0 0 0 this 0
	const special_check_right = [check_direction_len(first_cell, -x_add, -y_add, 4), check_direction_len(first_cell, x_add, y_add, 2)];

	return first_check ||
		   ((special_check_left[0] == special_check_left[1] && special_check_left[0] != null) ? special_check_left[0] : null) ||
		   ((special_check_center[0] == special_check_center[1] && special_check_center[0] != null) ? special_check_left[0] : null) ||
		   ((special_check_right[0] == special_check_right[1] && special_check_right[0] != null) ? special_check_right[0] : null)
}

const is_win = (cell_id: number): Player | null => {
	let value: Player | null =
		check_direction(cell_id, 1, 0)  ||
		check_direction(cell_id, -1, 0) ||
		check_direction(cell_id, 0, 1)  ||
		check_direction(cell_id, 0, -1) ||
		check_direction(cell_id, 1, 1)  ||
		check_direction(cell_id, -1, 1) ||
		check_direction(cell_id, 1, -1) ||
		check_direction(cell_id, -1, -1);

	return (value != null)? Player.fromNumber(value - 1) : null
}

const generate_table = (): string => {
	let [table, row] = ["", ""];
	let cell_id = 0;
	for (let row_id = 0; row_id < field_len; row_id++) {
		for (let col_id = 0; col_id < field_len; col_id++) {
			row += `<td> <button type="button" id="${cell_id}"> &nbsp </button> </td>\n`;
			cell_id++;
		}
		table += `<tr>${row}</tr>`;
        row = "";
	}
	return `<table><tbody>${table}</tbody>\n</table>`;
}

const receive_data = (req: http.IncomingMessage, callback: (data: string) => void) => {
	console.log("receive")
    let data = "";
    req.on("data", (chunk: string) => {
        data += chunk.toString();
    });
    req.on("end", () => {
        callback(data)
    });
}

const game =
	`<!DOCTYPE html><meta charset="UTF-8"><script type="module">${fs.readFileSync("lib/cell_update.js")}</script>` +
	generate_table() +
	`<p1 id="win"></p1>`;

// Creating server
const server = http.createServer((req, res) => {
	if (req.method == "POST") {
		switch (req.url) {
			case "/cell_update": {
                receive_data(req, (data) => {
                    console.log("POST data:", data);
                    res.end("Data received");
                    let ids = data.split(" ");
					let button_id = Number(ids[0])
					let player_id = Player.fromNumber(Number(ids[1]))
                    if (button_id < 400 && !table.has(button_id) && current_move == player_id && ids[2] == (passwords.get(player_id) as string)) {
                        table.set(button_id, player_id);
						sync_data = SyncData.fromNumber(button_id);
						last_move = current_move;
						if (current_move == Player.First) {
							current_move = Player.Second
						} else {
							current_move = Player.First
						}

                        let player_win = is_win(button_id);
                        if (player_win != null) {
							console.log(`Player ${player_win} is win!`)
							setTimeout(() => {
								sync_data = SyncData.GameEnd;
								current_move = player_win;
							}, 300)
                        }
                    } else {
                        console.log(`intresting connection: ${req.socket.remoteAddress}`);
                    }
                })
				break;
			}
			case "/cell_sync": {
				res.end(`${SyncData.toString(sync_data)} ${last_move}`);
			}
		}
	} else {
		switch (req.url) {
			case "/": {
				randomBytes(15, (err, buf) => {
					if (err) throw err;
					if (!server_full) {
						let password = buf.toString("hex");
						passwords.set(player, password);
						res.writeHead(200, { "Content-Type": "text/html" });
						res.end(game.replace("'constant_player_id'", player.toString()).replace("'password'", `"${password}"`));
						if (player == Player.First) {
							player = Player.Second
						} else {
							console.log("Server full!")
							server_full = true
						}
					} else {
						res.writeHead(200, { "Content-Type": "text/plain" });
						res.end("Люди уже играют")
					}
				});
				break;
			}

			case "/enums": {
				res.writeHead(200, { "Content-Type": "text/javascript" });
				res.end(fs.readFileSync("lib/enums.js"))
				break;
			}
		}
	}
});

server.listen(3000, "localhost", () => {
	console.log("hello");
});