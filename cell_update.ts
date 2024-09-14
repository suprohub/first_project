import { Player, SyncData, last_normal_data } from "./enums";
const player_id: any = 'constant_player_id';
const password = 'password'
let move = (player_id == 0)
let last_data = SyncData.GameStart;

console.log(player_id, move)
document.addEventListener("click", (mouse_event) => {
    console.log(move)
    if (move) {
        const target = (<HTMLElement>mouse_event.target);
        if (target) {
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
            let sync_data = SyncData.fromNumber(Number(data[0].replace("b", "")))
            let sync_player_id = Player.fromNumber(Number(data[1]))
            if (sync_data == SyncData.GameEnd) {
                const text = document.getElementById("win") as HTMLElement;
                text.innerHTML = `Выйграл игрок номер ${data[1]}`
            } else if (sync_data != SyncData.GameStart && last_data != last_normal_data) {
                const button = document.getElementById(`b${data[0]}`) as HTMLElement;
                button.setAttribute("disabled", "true")
                button.innerHTML = sync_player_id.toString()
                console.log(sync_player_id, player_id, (player_id === 0)? 1 : player_id - 1)
                if (sync_player_id == ((player_id == 0)? 1 : 0)) {
                    move = true
                }
                last_data = sync_data
            }
        }

        await sleep(250)
    }
};

sync()