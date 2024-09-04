
(async function() {
    const player_id =
    await fetch(`${window.location.href}join`, {
        method: "POST"
    }).then(async response => await response.text())
    var move = (player_id == 0)

    document.addEventListener("click", (mouse_event) => {
        if (!move) {
            const button_id = mouse_event.target.id;
            if (button_id) {
                const button = document.getElementById(button_id)
                fetch(`${window.location.href}cell_update`, {
                    method: "POST",
                    body: `${button_id} ${player_id}`
                })
                move = false
            }
        }
    })
    var last_data = "";
    
    for (;;) {
        fetch(`${window.location.href}cell_sync`, {
            method: "POST"
        }).then(async response => {
            var data = (await response.text()).split(" ")
            if (data[0] != -1 && last_data != data[0]) {
                const button = document.getElementById(`b${data[0]}`)
                button.setAttribute("disabled", true)
                button.innerHTML = data[1]
                last_data = data[0]

                if (data[0] == player_id - 1) {
                    move = true
                }
            }
        })
        await sleep(100)
    }
})()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
