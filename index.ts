import * as http from "node:http";
import * as fs from "node:fs";

const field_len = 20;
const game =
	`<!DOCTYPE html><meta charset="UTF-8"><script>${fs.readFileSync("cell_update.js")}</script>` +
	generate_table() +
	`<p1 id="win"></p1>`;
var table: Map<number, number> = new Map();
var last_player = 0;
var current_move = 0;
var sync_data = -1;

// Creating server
const server = http.createServer((req, res) => {
	if (req.method == "POST") {
		switch (req.url) {
			case "/cell_update": {
                receive_data(req, (data) => {
                    console.log("POST data:", data);
                    res.end("Data received");
    
                    var ids: number[] = data
                        .replace("b", "")
                        .split(" ")
                        .map((val) => Number(val));
                    if (ids[0] < 400 && !table.has(ids[0]) && current_move == ids[1]) {
                        table.set(ids[0], ids[1]);
                        sync_data = ids[0];
                        current_move++;
                        if (current_move == 2) {
                            current_move = 0;
                        }
                        var check = is_win(ids[0]);
                        if (!Number.isNaN(check)) {
                            sync_data = check;
                            current_move = -1;
                        }
                    } else {
                        console.log(`intresting connection: ${req.socket.remoteAddress}`);
                    }
                })
				break;
			}
			case "/cell_sync": {
				var old_move = current_move - 1;
				if (old_move == -1) {
					old_move = 1;
				}
				res.end(`${sync_data} ${old_move}`);
			}
		}
	} else {
		switch (req.url) {
			case "/": {
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(game.replace("'constant_player_id'", last_player.toString()));
				console.log(`new player ${last_player}`);
				last_player++;
				break;
			}
		}
	}
});

server.listen(3000, "localhost", () => {
	console.log("hello");
});

function is_win(cell_id: number): number {
	var value: number =
		check_direction(cell_id, 0, 1)  ||
		check_direction(cell_id, 0, -1) ||
		check_direction(cell_id, 1, 0)  ||
		check_direction(cell_id, -1, 0) ||
		check_direction(cell_id, 1, 1)  ||
		check_direction(cell_id, 1, -1) ||
		check_direction(cell_id, -1, 1) ||
		check_direction(cell_id, -1, -1);
	if (!Number.isNaN(value)) {
		return value;
	}
	return NaN;
}

function check_direction(
	first_cell: number,
	y_add: number,
	x_add: number,
): number {
	var values: any[] = [];
	var value: number | undefined;
	var [x, y] = [0, 0];
	for (var i = 0; i < 4; i++) {
		value = table.get(first_cell + y + x);
		x += y_add * field_len;
		y += x_add;
		values.push(value);
	}
	for (var i = 0; i < last_player; i++) {
		if (values.every((value) => value == i)) {
			console.log("win");
			return i;
		}
	}
	return NaN;
}

function generate_table(): string {
	var [table, row] = ["", ""];
	var cell_id = 0;
	for (var row_id = 0; row_id < field_len; row_id++) {
		for (var col_id = 0; col_id < field_len; col_id++) {
			row += `<td> <button type="button" id="b${cell_id}"> &nbsp </button> </td>\n`;
			cell_id++;
		}
		table += `<tr>${row}</tr>`;
        row = "";
	}
	return `<table><tbody>${table}</tbody>\n</table>`;
}

function receive_data(req, callback: (data: string) => void) {
    var data = "";
    req.on("data", (chunk) => {
        data += chunk.toString();
    });
    req.on("end", () => {
        callback(data)
    });
}