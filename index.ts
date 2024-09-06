import * as http from "node:http";
import * as fs from "node:fs";
import { randomBytes } from "node:crypto";

const field_len = 20;
const table: Map<number, number> = new Map();
const passwords: Map<number, string> = new Map();
let last_player = 0;
let current_move = 0;
let sync_data = -1;


const check_direction_len = (
	first_cell: number,
	x_add: number,
	y_add: number,
	len: number
): number | null => {
	let values: any[] = [];
	let value: number | undefined;
	let [x, y] = [0, 0];
	for (let i = 0; i < len; i++) {
		value = table.get(first_cell + y + x);
		y += y_add * field_len;
		x += x_add;
		values.push(value);
	}
	for (let i = 0; i < last_player; i++) {
		if (values.every((value) => value == i)) {
			return i + 1;
		}
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

const is_win = (cell_id: number): number | null => {
	// null || 0 || null => null
	// null || 1 || null => 1
	// null | null => 0
	let value: number | null =
		check_direction(cell_id, 1, 0)  ||
		check_direction(cell_id, -1, 0) ||
		check_direction(cell_id, 0, 1)  ||
		check_direction(cell_id, 0, -1) ||
		check_direction(cell_id, 1, 1)  ||
		check_direction(cell_id, -1, 1) ||
		check_direction(cell_id, 1, -1) ||
		check_direction(cell_id, -1, -1);

	if (value != null) {
		return value - 1;
	}
	return null;
}

const generate_table = (): string => {
	let [table, row] = ["", ""];
	let cell_id = 0;
	for (let row_id = 0; row_id < field_len; row_id++) {
		for (let col_id = 0; col_id < field_len; col_id++) {
			row += `<td> <button type="button" id="b${cell_id}"> &nbsp </button> </td>\n`;
			cell_id++;
		}
		table += `<tr>${row}</tr>`;
        row = "";
	}
	return `<table><tbody>${table}</tbody>\n</table>`;
}

const receive_data = (req, callback: (data: string) => void) => {
	console.log("receive")
    let data = "";
    req.on("data", (chunk) => {
        data += chunk.toString();
    });
    req.on("end", () => {
        callback(data)
    });
}

const game =
	`<!DOCTYPE html><meta charset="UTF-8"><script>${fs.readFileSync("cell_update.js")}</script>` +
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
					let button_id = Number(ids[0].replace("b", ""))
					let player_id = Number(ids[1])
                    if (button_id < 400 && !table.has(button_id) && current_move == player_id && ids[2] == (passwords.get(player_id) as string)) {
                        table.set(button_id, player_id);
                        sync_data = button_id;
                        current_move++;
                        if (current_move == 2) {
                            current_move = 0;
                        }
                        let check = is_win(button_id);
                        if (check != null) {
							console.log("win")
							setTimeout(() => {
								sync_data = check;
								current_move = -1;
							}, 150)
                        }
                    } else {
                        console.log(`intresting connection: ${req.socket.remoteAddress}`);
                    }
                })
				break;
			}
			case "/cell_sync": {
				let old_move = current_move - 1;
				if (old_move == -1) {
					old_move = 1;
				}
				res.end(`${sync_data} ${old_move}`);
			}
		}
	} else {
		switch (req.url) {
			case "/": {
				randomBytes(15, (err, buf) => {
					if (err) throw err;
					let password = buf.toString("hex");
					passwords.set(last_player, password);
					res.writeHead(200, { "Content-Type": "text/html" });
					res.end(game.replace("'constant_player_id'", last_player.toString()).replace("'password'", `"${password}"`));
					console.log(`new player ${last_player}`);
					last_player++;
				});
				break;
			}
		}
	}
});

server.listen(3000, "localhost", () => {
	console.log("hello");
});