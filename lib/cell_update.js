"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const player_id = 'constant_player_id';
const password = 'password';
let move = (player_id == 0);
let last_data = enums_1.SyncData.GameStart;
console.log(player_id, move);
document.addEventListener("click", (mouse_event) => {
    console.log(move);
    if (move) {
        const target = mouse_event.target;
        if (target) {
            fetch(`${window.location.href}cell_update`, {
                method: "POST",
                body: `${target.id} ${player_id} ${password}`
            });
            move = false;
        }
    }
});
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
const sleep_thread_burn = (ms) => {
    for (let e = new Date().getTime() + ms; new Date().getTime() <= e;) { }
};
const sync = async () => {
    for (;;) {
        if (!move) {
            let data = (await (await fetch(`${window.location.href}cell_sync`, { method: "POST" })).text()).split(" ");
            let sync_data = enums_1.SyncData.fromNumber(Number(data[0].replace("b", "")));
            let sync_player_id = enums_1.Player.fromNumber(Number(data[1]));
            if (sync_data == enums_1.SyncData.GameEnd) {
                const text = document.getElementById("win");
                text.innerHTML = `Выйграл игрок номер ${data[1]}`;
            }
            else if (sync_data != enums_1.SyncData.GameStart && last_data != enums_1.last_normal_data) {
                const button = document.getElementById(`b${data[0]}`);
                button.setAttribute("disabled", "true");
                button.innerHTML = sync_player_id.toString();
                console.log(sync_player_id, player_id, (player_id === 0) ? 1 : player_id - 1);
                if (sync_player_id == ((player_id == 0) ? 1 : 0)) {
                    move = true;
                }
                last_data = sync_data;
            }
        }
        await sleep(250);
    }
};
sync();
//# sourceMappingURL=cell_update.js.map