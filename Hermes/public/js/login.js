$('#join-btn').on('click', (event) => {
    let username = $('#username').val();
    let room = $('#room').val().toLowerCase();
    if (username.length == 0 || room.length == 0) {
        alert("Please enter a name and room")
        return false;
    }
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('room', room);
    sessionStorage.setItem('type', 0);
    window.location.href = "https://" + window.location.hostname + ":" +location.port + "/call_hub.html";
    return true;
});

$('#create-btn').on('click', (event) => {
    let username = $('#username').val();
    let room = $('#room').val().toLowerCase();
    if (username.length == 0 || room.length == 0) {
        alert("Please enter a name and room")
        return false;
    }
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('room', room);
    sessionStorage.setItem('type', 1);
    window.location.href = "https://" + window.location.hostname + ":" +location.port + "/call_hub.html";
    return true;
});
