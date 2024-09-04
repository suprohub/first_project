
import * as http from 'node:http'
import * as fs from 'node:fs'
import { exit } from 'node:process';

const buttons_table = `<script>${fs.readFileSync("cell_update.js")}</script>` + generate_table() + `<p1 id="win"></p1>`;
const field_len = 20;
var table: Map<number, number> = new Map();
var last_player = 0;
var current_move = 0;
var sync_data = -1;

// Creating server 
const server = http.createServer((req, res) => {
    if (req.url == "/") {
        res.writeHead(200, { "Content-Type" : "text/html" } );
        res.write(buttons_table)
        res.end();
    } else if (req.url == "/cell_update" && req.method == "POST") {
        var data = '';
        req.on('data', chunk => {
          data += chunk.toString();
        });
        req.on('end', () => {
            console.log('POST data:', data);
            res.end('Data received');
            
            var ids: number[] = data.replace("b", "").split(" ").map(val => Number(val));
            console.log(ids)
            if (ids[0] < 400 && !table.has(ids[0]) && current_move == ids[1]) {
                table.set(ids[0], ids[1])
                sync_data = ids[0]
                current_move++
                if (current_move == 2) {
                    current_move = 0
                }
                var check = win_check(ids[0]);
                if (!Number.isNaN(check)) {
                    sync_data = check
                    current_move = -1
                }
            } else {
                console.log(`cheater is ${req.socket.remoteAddress}`)
            }
        });
    } else if (req.url == "/cell_sync" && req.method == "POST") {
        var old_move = current_move - 1;
        if (old_move == -1) {
            old_move = 1
        }
        res.end(`${sync_data} ${old_move}`)
    } else if (req.url == "/join" && req.method == "POST") {
        console.log(`new player ${last_player}`)
        res.end(last_player.toString())
        last_player++
    }

})

server.listen(3000, "localhost", () => {
    console.log("hello");
})


function win_check(cell_id: number): number {
    var value: number = check_direction(cell_id, 0, 1) || check_direction(cell_id, 0, -1) || check_direction(cell_id, 20, 0) || check_direction(cell_id, -20, 0)
        || check_direction(cell_id, 20, 1) || check_direction(cell_id, 20, -1) || check_direction(cell_id, -20, 1) || check_direction(cell_id, -20, -1)
    if (!Number.isNaN(value)) {
        return value
    }
    return NaN;
}

function check_direction(first_cell: number, y_add: number, x_add: number): number {
    var values: any[] = []
    var value: number | undefined;
    var x = 0
    var y = 0
    for (var i = 0; i < 4; i++) {
        value = table.get(first_cell + y + x);
        x += y_add
        y += x_add
        values.push(value)
    }
    for (var i = 0; i < last_player; i++) {
        if (values.every((value) => value == i)) {
            console.log("win")
            return i
        }
    }
    return NaN
}

function generate_table(): string {
    var table = ""
    var cell_id = 0
    for (var row_id = 0; row_id < 20; row_id++) {
        var row = ""
        for (var col_id = 0; col_id < 20; col_id++) {
            row += `<td> <button type="button" id="b${cell_id}"> &nbsp </button> </td>\n`
            cell_id++
        }
        table += `<tr>${row}</tr>`
    }
    return `<table><tbody>${table}</tbody>\n</table>`
}