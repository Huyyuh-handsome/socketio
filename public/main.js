$(function () {
    var socket = io("ws://localhost", {
        query: {
            auth: "123"
        }
    });
    $('#messageForm').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('message', $('#message').val());
        $('#message').val('');
        return false;
    });
    socket.on('broadcast message', function (msg) {
        $('#messages').append($('<li>').text(msg.value));
    });
});