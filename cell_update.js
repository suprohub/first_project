
const player_id = 'constant_player_id';
const password = 'password'
let move = (player_id == 0)
let last_data = "";

console.log(player_id, move)

document.addEventListener("click", (mouse_event) => {
    console.log(move)
    if (move) {
        const button_id = mouse_event.target.id;
        if (button_id) {
            fetch(`${window.location.href}cell_update`, {
                method: "POST",
                body: `${button_id} ${player_id} ${password}`
            })
            move = false
        }
    }
})

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const sleep_thread_burn = (ms) => {
  for (let e = new Date().getTime() + ms; new Date().getTime() <= e; ) {}
} 

const sync = async () => {
    for (;;) {
        let data = (await (await fetch(`${window.location.href}cell_sync`, { method: "POST" })).text()).split(" ");
            
        if (data[1] == -2) {
            const text = document.getElementById("win");
            text.innerHTML = `Выйграл игрок номер ${data[0]}`
            loop = false
        } else if (data[0] != -1 && last_data != data[0]) {
            const button = document.getElementById(`b${data[0]}`)
            button.setAttribute("disabled", true)
            button.innerHTML = data[1]
            last_data = data[0]
            console.log(data[1], player_id, (player_id === 0)? 1 : player_id - 1)
            if (data[1] == (player_id === 0)? 1 : player_id - 1) {
                move = true
            }
        }

        await sleep(100)
    }
};

sync()