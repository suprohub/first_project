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
const game = `<!DOCTYPE html><meta charset="UTF-8"><script>${fs.readFileSync("lib/enums.js")}</script><script>${fs.readFileSync("lib/cell_update.js")}</script>` +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQWtDO0FBQ2xDLDRDQUE4QjtBQUM5Qiw2Q0FBMEM7QUFDMUMsbUNBQTZEO0FBRTdELE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFNLEtBQUssR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM3QyxNQUFNLFNBQVMsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNqRCxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDeEIsSUFBSSxNQUFNLEdBQUcsY0FBTSxDQUFDLEtBQUssQ0FBQztBQUMxQixJQUFJLFNBQVMsR0FBRyxjQUFNLENBQUMsS0FBSyxDQUFDO0FBQzdCLElBQUksWUFBWSxHQUFHLGNBQU0sQ0FBQyxLQUFLLENBQUM7QUFDaEMsSUFBSSxTQUFTLEdBQUcsZ0JBQVEsQ0FBQyxTQUFTLENBQUM7QUFHbkMsTUFBTSxtQkFBbUIsR0FBRyxDQUMzQixVQUFrQixFQUNsQixLQUFhLEVBQ2IsS0FBYSxFQUNiLEdBQVcsRUFDSyxFQUFFO0lBQ2xCLElBQUksTUFBTSxHQUFVLEVBQUUsQ0FBQztJQUN2QixJQUFJLEtBQXlCLENBQUM7SUFDOUIsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDOUIsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLENBQUMsSUFBSSxLQUFLLEdBQUcsU0FB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QkFBTSxDQUFDO3dCQUNQLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7d0JBQ3JELEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtvQkFDM0IsQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQztnQkFDSCxNQUFNO1lBQ1AsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0FBQ0YsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBodHRwIGZyb20gXCJub2RlOmh0dHBcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gXCJub2RlOmNyeXB0b1wiO1xuaW1wb3J0IHsgUGxheWVyLCBTeW5jRGF0YSwgbGFzdF9ub3JtYWxfZGF0YSB9IGZyb20gXCIuL2VudW1zXCI7XG5cbmNvbnN0IGZpZWxkX2xlbiA9IDIwO1xuY29uc3QgdGFibGU6IE1hcDxudW1iZXIsIFBsYXllcj4gPSBuZXcgTWFwKCk7XG5jb25zdCBwYXNzd29yZHM6IE1hcDxQbGF5ZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5sZXQgc2VydmVyX2Z1bGwgPSBmYWxzZTtcbmxldCBwbGF5ZXIgPSBQbGF5ZXIuRmlyc3Q7XG5sZXQgbGFzdF9tb3ZlID0gUGxheWVyLkZpcnN0O1xubGV0IGN1cnJlbnRfbW92ZSA9IFBsYXllci5GaXJzdDtcbmxldCBzeW5jX2RhdGEgPSBTeW5jRGF0YS5HYW1lU3RhcnQ7XG5cblxuY29uc3QgY2hlY2tfZGlyZWN0aW9uX2xlbiA9IChcblx0Zmlyc3RfY2VsbDogbnVtYmVyLFxuXHR4X2FkZDogbnVtYmVyLFxuXHR5X2FkZDogbnVtYmVyLFxuXHRsZW46IG51bWJlclxuKTogbnVtYmVyIHwgbnVsbCA9PiB7XG5cdGxldCB2YWx1ZXM6IGFueVtdID0gW107XG5cdGxldCB2YWx1ZTogUGxheWVyIHwgdW5kZWZpbmVkO1xuXHRsZXQgW3gsIHldID0gWzAsIDBdO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0dmFsdWUgPSB0YWJsZS5nZXQoZmlyc3RfY2VsbCArIHkgKyB4KTtcblx0XHR2YWx1ZXMucHVzaCh2YWx1ZSk7XG5cdFx0eSArPSB5X2FkZCAqIGZpZWxkX2xlbjtcblx0XHR4ICs9IHhfYWRkO1xuXHR9XG5cdC8vIEJ5cGFzcyBudWxsIHx8IDBcblx0aWYgKHZhbHVlcy5ldmVyeSgodmFsdWUpID0+IHZhbHVlID09IFBsYXllci5GaXJzdCkpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXHRpZiAodmFsdWVzLmV2ZXJ5KCh2YWx1ZSkgPT4gdmFsdWUgPT0gUGxheWVyLlNlY29uZCkpIHtcblx0XHRyZXR1cm4gMjtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgY2hlY2tfZGlyZWN0aW9uID0gKFxuXHRmaXJzdF9jZWxsOiBudW1iZXIsXG5cdHhfYWRkOiBudW1iZXIsXG5cdHlfYWRkOiBudW1iZXIsXG4pOiBudW1iZXIgfCBudWxsID0+IHtcblx0Y29uc3QgZmlyc3RfY2hlY2sgPSBjaGVja19kaXJlY3Rpb25fbGVuKGZpcnN0X2NlbGwsIHhfYWRkLCB5X2FkZCwgNSk7XG5cdC8vIDAgdGhpcyAwIDAgMFxuXHRjb25zdCBzcGVjaWFsX2NoZWNrX2xlZnQgPSBbY2hlY2tfZGlyZWN0aW9uX2xlbihmaXJzdF9jZWxsLCAteF9hZGQsIC15X2FkZCwgMiksIGNoZWNrX2RpcmVjdGlvbl9sZW4oZmlyc3RfY2VsbCwgeF9hZGQsIHlfYWRkLCA0KV07XG5cdC8vIDAgMCB0aGlzIDAgMFxuXHRjb25zdCBzcGVjaWFsX2NoZWNrX2NlbnRlciA9IFtjaGVja19kaXJlY3Rpb25fbGVuKGZpcnN0X2NlbGwsIC14X2FkZCwgLXlfYWRkLCAzKSwgY2hlY2tfZGlyZWN0aW9uX2xlbihmaXJzdF9jZWxsLCB4X2FkZCwgeV9hZGQsIDMpXTtcblx0Ly8gMCAwIDAgdGhpcyAwXG5cdGNvbnN0IHNwZWNpYWxfY2hlY2tfcmlnaHQgPSBbY2hlY2tfZGlyZWN0aW9uX2xlbihmaXJzdF9jZWxsLCAteF9hZGQsIC15X2FkZCwgNCksIGNoZWNrX2RpcmVjdGlvbl9sZW4oZmlyc3RfY2VsbCwgeF9hZGQsIHlfYWRkLCAyKV07XG5cblx0cmV0dXJuIGZpcnN0X2NoZWNrIHx8XG5cdFx0ICAgKChzcGVjaWFsX2NoZWNrX2xlZnRbMF0gPT0gc3BlY2lhbF9jaGVja19sZWZ0WzFdICYmIHNwZWNpYWxfY2hlY2tfbGVmdFswXSAhPSBudWxsKSA/IHNwZWNpYWxfY2hlY2tfbGVmdFswXSA6IG51bGwpIHx8XG5cdFx0ICAgKChzcGVjaWFsX2NoZWNrX2NlbnRlclswXSA9PSBzcGVjaWFsX2NoZWNrX2NlbnRlclsxXSAmJiBzcGVjaWFsX2NoZWNrX2NlbnRlclswXSAhPSBudWxsKSA/IHNwZWNpYWxfY2hlY2tfbGVmdFswXSA6IG51bGwpIHx8XG5cdFx0ICAgKChzcGVjaWFsX2NoZWNrX3JpZ2h0WzBdID09IHNwZWNpYWxfY2hlY2tfcmlnaHRbMV0gJiYgc3BlY2lhbF9jaGVja19yaWdodFswXSAhPSBudWxsKSA/IHNwZWNpYWxfY2hlY2tfcmlnaHRbMF0gOiBudWxsKVxufVxuXG5jb25zdCBpc193aW4gPSAoY2VsbF9pZDogbnVtYmVyKTogUGxheWVyIHwgbnVsbCA9PiB7XG5cdGxldCB2YWx1ZTogUGxheWVyIHwgbnVsbCA9XG5cdFx0Y2hlY2tfZGlyZWN0aW9uKGNlbGxfaWQsIDEsIDApICB8fFxuXHRcdGNoZWNrX2RpcmVjdGlvbihjZWxsX2lkLCAtMSwgMCkgfHxcblx0XHRjaGVja19kaXJlY3Rpb24oY2VsbF9pZCwgMCwgMSkgIHx8XG5cdFx0Y2hlY2tfZGlyZWN0aW9uKGNlbGxfaWQsIDAsIC0xKSB8fFxuXHRcdGNoZWNrX2RpcmVjdGlvbihjZWxsX2lkLCAxLCAxKSAgfHxcblx0XHRjaGVja19kaXJlY3Rpb24oY2VsbF9pZCwgLTEsIDEpIHx8XG5cdFx0Y2hlY2tfZGlyZWN0aW9uKGNlbGxfaWQsIDEsIC0xKSB8fFxuXHRcdGNoZWNrX2RpcmVjdGlvbihjZWxsX2lkLCAtMSwgLTEpO1xuXG5cdHJldHVybiAodmFsdWUgIT0gbnVsbCk/IFBsYXllci5mcm9tTnVtYmVyKHZhbHVlIC0gMSkgOiBudWxsXG59XG5cbmNvbnN0IGdlbmVyYXRlX3RhYmxlID0gKCk6IHN0cmluZyA9PiB7XG5cdGxldCBbdGFibGUsIHJvd10gPSBbXCJcIiwgXCJcIl07XG5cdGxldCBjZWxsX2lkID0gMDtcblx0Zm9yIChsZXQgcm93X2lkID0gMDsgcm93X2lkIDwgZmllbGRfbGVuOyByb3dfaWQrKykge1xuXHRcdGZvciAobGV0IGNvbF9pZCA9IDA7IGNvbF9pZCA8IGZpZWxkX2xlbjsgY29sX2lkKyspIHtcblx0XHRcdHJvdyArPSBgPHRkPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBpZD1cImIke2NlbGxfaWR9XCI+ICZuYnNwIDwvYnV0dG9uPiA8L3RkPlxcbmA7XG5cdFx0XHRjZWxsX2lkKys7XG5cdFx0fVxuXHRcdHRhYmxlICs9IGA8dHI+JHtyb3d9PC90cj5gO1xuICAgICAgICByb3cgPSBcIlwiO1xuXHR9XG5cdHJldHVybiBgPHRhYmxlPjx0Ym9keT4ke3RhYmxlfTwvdGJvZHk+XFxuPC90YWJsZT5gO1xufVxuXG5jb25zdCByZWNlaXZlX2RhdGEgPSAocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgY2FsbGJhY2s6IChkYXRhOiBzdHJpbmcpID0+IHZvaWQpID0+IHtcblx0Y29uc29sZS5sb2coXCJyZWNlaXZlXCIpXG4gICAgbGV0IGRhdGEgPSBcIlwiO1xuICAgIHJlcS5vbihcImRhdGFcIiwgKGNodW5rOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZGF0YSArPSBjaHVuay50b1N0cmluZygpO1xuICAgIH0pO1xuICAgIHJlcS5vbihcImVuZFwiLCAoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKGRhdGEpXG4gICAgfSk7XG59XG5cbmNvbnN0IGdhbWUgPVxuXHRgPCFET0NUWVBFIGh0bWw+PG1ldGEgY2hhcnNldD1cIlVURi04XCI+PHNjcmlwdD4ke2ZzLnJlYWRGaWxlU3luYyhcImxpYi9lbnVtcy5qc1wiKX08L3NjcmlwdD48c2NyaXB0PiR7ZnMucmVhZEZpbGVTeW5jKFwibGliL2NlbGxfdXBkYXRlLmpzXCIpfTwvc2NyaXB0PmAgK1xuXHRnZW5lcmF0ZV90YWJsZSgpICtcblx0YDxwMSBpZD1cIndpblwiPjwvcDE+YDtcblxuLy8gQ3JlYXRpbmcgc2VydmVyXG5jb25zdCBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcblx0aWYgKHJlcS5tZXRob2QgPT0gXCJQT1NUXCIpIHtcblx0XHRzd2l0Y2ggKHJlcS51cmwpIHtcblx0XHRcdGNhc2UgXCIvY2VsbF91cGRhdGVcIjoge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVfZGF0YShyZXEsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUE9TVCBkYXRhOlwiLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmVuZChcIkRhdGEgcmVjZWl2ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpZHMgPSBkYXRhLnNwbGl0KFwiIFwiKTtcblx0XHRcdFx0XHRsZXQgYnV0dG9uX2lkID0gTnVtYmVyKGlkc1swXS5yZXBsYWNlKFwiYlwiLCBcIlwiKSlcblx0XHRcdFx0XHRsZXQgcGxheWVyX2lkID0gUGxheWVyLmZyb21OdW1iZXIoTnVtYmVyKGlkc1sxXSkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChidXR0b25faWQgPCA0MDAgJiYgIXRhYmxlLmhhcyhidXR0b25faWQpICYmIGN1cnJlbnRfbW92ZSA9PSBwbGF5ZXJfaWQgJiYgaWRzWzJdID09IChwYXNzd29yZHMuZ2V0KHBsYXllcl9pZCkgYXMgc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFibGUuc2V0KGJ1dHRvbl9pZCwgcGxheWVyX2lkKTtcblx0XHRcdFx0XHRcdHN5bmNfZGF0YSA9IFN5bmNEYXRhLmZyb21OdW1iZXIoYnV0dG9uX2lkKTtcblx0XHRcdFx0XHRcdGxhc3RfbW92ZSA9IGN1cnJlbnRfbW92ZTtcblx0XHRcdFx0XHRcdGlmIChjdXJyZW50X21vdmUgPT0gUGxheWVyLkZpcnN0KSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRfbW92ZSA9IFBsYXllci5TZWNvbmRcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRfbW92ZSA9IFBsYXllci5GaXJzdFxuXHRcdFx0XHRcdFx0fVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGxheWVyX3dpbiA9IGlzX3dpbihidXR0b25faWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllcl93aW4gIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhgUGxheWVyICR7cGxheWVyX3dpbn0gaXMgd2luIWApXG5cdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHN5bmNfZGF0YSA9IFN5bmNEYXRhLkdhbWVFbmQ7XG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudF9tb3ZlID0gcGxheWVyX3dpbjtcblx0XHRcdFx0XHRcdFx0fSwgMzAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGludHJlc3RpbmcgY29ubmVjdGlvbjogJHtyZXEuc29ja2V0LnJlbW90ZUFkZHJlc3N9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGNhc2UgXCIvY2VsbF9zeW5jXCI6IHtcblx0XHRcdFx0cmVzLmVuZChgJHtTeW5jRGF0YS50b051bWJlcihzeW5jX2RhdGEpfSAke2xhc3RfbW92ZX1gKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChyZXEudXJsKSB7XG5cdFx0XHRjYXNlIFwiL1wiOiB7XG5cdFx0XHRcdHJhbmRvbUJ5dGVzKDE1LCAoZXJyLCBidWYpID0+IHtcblx0XHRcdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnI7XG5cdFx0XHRcdFx0aWYgKCFzZXJ2ZXJfZnVsbCkge1xuXHRcdFx0XHRcdFx0bGV0IHBhc3N3b3JkID0gYnVmLnRvU3RyaW5nKFwiaGV4XCIpO1xuXHRcdFx0XHRcdFx0cGFzc3dvcmRzLnNldChwbGF5ZXIsIHBhc3N3b3JkKTtcblx0XHRcdFx0XHRcdHJlcy53cml0ZUhlYWQoMjAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9odG1sXCIgfSk7XG5cdFx0XHRcdFx0XHRyZXMuZW5kKGdhbWUucmVwbGFjZShcIidjb25zdGFudF9wbGF5ZXJfaWQnXCIsIHBsYXllci50b1N0cmluZygpKS5yZXBsYWNlKFwiJ3Bhc3N3b3JkJ1wiLCBgXCIke3Bhc3N3b3JkfVwiYCkpO1xuXHRcdFx0XHRcdFx0aWYgKHBsYXllciA9PSBQbGF5ZXIuRmlyc3QpIHtcblx0XHRcdFx0XHRcdFx0cGxheWVyID0gUGxheWVyLlNlY29uZFxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJTZXJ2ZXIgZnVsbCFcIilcblx0XHRcdFx0XHRcdFx0c2VydmVyX2Z1bGwgPSB0cnVlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlcy53cml0ZUhlYWQoMjAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiIH0pO1xuXHRcdFx0XHRcdFx0cmVzLmVuZChcItCb0Y7QtNC4INGD0LbQtSDQuNCz0YDQsNGO0YJcIilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pO1xuXG5zZXJ2ZXIubGlzdGVuKDMwMDAsIFwibG9jYWxob3N0XCIsICgpID0+IHtcblx0Y29uc29sZS5sb2coXCJoZWxsb1wiKTtcbn0pOyJdfQ==