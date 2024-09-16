import { SyncData, Player } from "./enums";
const player_id: any = 'constant_player_id';
const password = 'password'
let move = (player_id == 0)
let last_data = SyncData.GameStart;
let last_player = 0;

console.log(player_id, move)
document.addEventListener("click", (mouse_event) => {
    console.log(move)
    if (move) {
        const target = (<HTMLElement>mouse_event.target);
        if (target && target.id != "") {
            console.log(target.id)
            fetch(`${window.location.href}cell_update`, {
                method: "POST",
                body: `${target.id} ${player_id} ${password}`
            })
            move = false
        }
    }
})

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const sleep_thread_burn = (ms: number) => {
  for (let e = new Date().getTime() + ms; new Date().getTime() <= e; ) {}
} 

const sync = async () => {
    for (;;) {
        if (!move) {
            let data = (await (await fetch(`${window.location.href}cell_sync`, { method: "POST" })).text()).split(" ");
            let sync_data = Number(data[0]);
            let sync_player_id = Number(data[1]);
            let button_id = Number(data[2]);
            if (sync_data == SyncData.GameEnd) {
                const button = document.getElementById(`${last_data}`) as HTMLElement;
                button.setAttribute("disabled", "true")
                button.innerHTML = last_player.toString()
                const text = document.getElementById("win") as HTMLElement;
                text.innerHTML = `Выйграл игрок номер ${sync_player_id}`
            } else if (sync_data != SyncData.GameStart && last_data != button_id ) {
                const button = document.getElementById(`${button_id}`) as HTMLElement;
                button.setAttribute("disabled", "true")
                button.innerHTML = sync_player_id.toString()
                if (sync_player_id == ((player_id == 0)? 1 : 0)) {
                    move = true
                }
                last_data = button_id
                last_player = sync_player_id
            }
        }

        await sleep(250)
    }
};

sync()