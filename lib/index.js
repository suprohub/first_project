"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("node:http"));
const fs = __importStar(require("node:fs"));
const node_crypto_1 = require("node:crypto");
const enums_1 = require("./enums");
const field_len = 20;
const table = new Map();
const passwords = new Map();
let server_full = false;
let player = enums_1.Player.First;
let last_move = enums_1.Player.First;
let current_move = enums_1.Player.First;
let sync_data = enums_1.SyncData.GameStart;
const check_direction_len = (first_cell, x_add, y_add, len) => {
    let values = [];
    let value;
    let [x, y] = [0, 0];
    for (let i = 0; i < len; i++) {
        value = table.get(first_cell + y + x);
        values.push(value);
        y += y_add * field_len;
        x += x_add;
    }
    // Bypass null || 0
    if (values.every((value) => value == enums_1.Player.First)) {
        return 1;
    }
    if (values.every((value) => value == enums_1.Player.Second)) {
        return 2;
    }
    return null;
};
const check_direction = (first_cell, x_add, y_add) => {
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
        ((special_check_right[0] == special_check_right[1] && special_check_right[0] != null) ? special_check_right[0] : null);
};
const is_win = (cell_id) => {
    let value = check_direction(cell_id, 1, 0) ||
        check_direction(cell_id, -1, 0) ||
        check_direction(cell_id, 0, 1) ||
        check_direction(cell_id, 0, -1) ||
        check_direction(cell_id, 1, 1) ||
        check_direction(cell_id, -1, 1) ||
        check_direction(cell_id, 1, -1) ||
        check_direction(cell_id, -1, -1);
    return (value != null) ? enums_1.Player.fromNumber(value - 1) : null;
};
const generate_table = () => {
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
};
const receive_data = (req, callback) => {
    console.log("receive");
    let data = "";
    req.on("data", (chunk) => {
        data += chunk.toString();
    });
    req.on("end", () => {
        callback(data);
    });
};
const game = `<!DOCTYPE html><meta charset="UTF-8"><script src="enums.js">${fs.readFileSync("lib/enums.js")}</script><script>${fs.readFileSync("lib/cell_update.js")}</script>` +
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
                    let button_id = Number(ids[0].replace("b", ""));
                    let player_id = enums_1.Player.fromNumber(Number(ids[1]));
                    if (button_id < 400 && !table.has(button_id) && current_move == player_id && ids[2] == passwords.get(player_id)) {
                        table.set(button_id, player_id);
                        sync_data = enums_1.SyncData.fromNumber(button_id);
                        last_move = current_move;
                        if (current_move == enums_1.Player.First) {
                            current_move = enums_1.Player.Second;
                        }
                        else {
                            current_move = enums_1.Player.First;
                        }
                        let player_win = is_win(button_id);
                        if (player_win != null) {
                            console.log(`Player ${player_win} is win!`);
                            setTimeout(() => {
                                sync_data = enums_1.SyncData.GameEnd;
                                current_move = player_win;
                            }, 300);
                        }
                    }
                    else {
                        console.log(`intresting connection: ${req.socket.remoteAddress}`);
                    }
                });
                break;
            }
            case "/cell_sync": {
                res.end(`${enums_1.SyncData.toNumber(sync_data)} ${last_move}`);
            }
        }
    }
    else {
        switch (req.url) {
            case "/": {
                (0, node_crypto_1.randomBytes)(15, (err, buf) => {
                    if (err)
                        throw err;
                    if (!server_full) {
                        let password = buf.toString("hex");
                        passwords.set(player, password);
                        res.writeHead(200, { "Content-Type": "text/html" });
                        res.end(game.replace("'constant_player_id'", player.toString()).replace("'password'", `"${password}"`));
                        if (player == enums_1.Player.First) {
                            player = enums_1.Player.Second;
                        }
                        else {
                            console.log("Server full!");
                            server_full = true;
                        }
                    }
                    else {
                        res.writeHead(200, { "Content-Type": "text/plain" });
                        res.end("Люди уже играют");
                    }
                });
                break;
            }
        }
    }
});
server.listen(3000, "localhost", () => {
    console.log("hello");
});
//# sourceMappingURL=index.js.map