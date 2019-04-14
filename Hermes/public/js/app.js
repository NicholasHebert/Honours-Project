window.addEventListener('load', () => {
    // Chat platform
    const chatTemplate = Handlebars.compile($('#chat-template').html());
    const chatContentTemplate = Handlebars.compile($('#chat-content-template').html());
    const chatEl = $('#chat');
    const messages = [];
    let username = sessionStorage.getItem('username');
    let roomName = sessionStorage.getItem('room');
    let type = sessionStorage.getItem('type');

    // Local Video
    const localVideoEl = $('#local-video');

    // Remote Videos
    const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html());
    const remoteVideosEl = $('#remote-videos');
    let remoteVideosCount = 0;
    localVideoEl.show();



    // create our webrtc connection
    var webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'local-video',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remote-videos',
        // immediately ask for camera access
        autoRequestMedia: true,
        //bugfix for ignored connections
        signalingOptions: {
            "force new connection": true
        },
        media: {
            audio: true,
            video: {
                //maxframerate can be called here alongside any other peer sided attributes.
                //add constraints to increase performance.
                mandatory: {
                    maxWidth: 640,
                    maxHeight: 480,
                }
            }
        }
    });

    var hasJoinedRoom = false;

    webrtc.on('connectionReady', function() {
        joinRoom();
    });
    webrtc.on('readyToCall', function() {
        joinRoom();
    });
    webrtc.on('localStream', function() {
        reJoinRoom();
    });

    function joinRoom() {
        if (!hasJoinedRoom) {
            hasJoinedRoom = true;
            webrtc.joinRoom(roomName);
            showChatRoom(roomName);
        }
    }

    function reJoinRoom() {
        if (hasJoinedRoom) {
            hasJoinedRoom = false;
            webrtc.leaveRoom();
            joinRoom(roomName);
            showChatRoom(roomName);
        }
    }
    // Remote video was added
    webrtc.on('videoAdded', (video, peer) => {
        const id = webrtc.getDomId(peer);
        const html = remoteVideoTemplate({
            id
        });
        remoteVideosEl.append(html);
        $(`#${id}`).html(video).addClass('ui medium image').attr(width='300px');
        remoteVideosCount++;
        console.log(video);
    });

    webrtc.on('createdPeer', (peer) => {
        console.log(peer);
    });

    // Update Chat Messages
    const updateChatMessages = () => {
        const html = chatContentTemplate({
            messages
        });
        const chatContentEl = $('#chat-content');
        chatContentEl.html(html);
        // automatically scroll downwards
        const scrollHeight = chatContentEl.prop('scrollHeight');
        chatContentEl.animate({
            scrollTop: scrollHeight
        }, 'slow');
    };

    // Post Local Message
    const postMessage = (message) => {
        const chatMessage = {
            username,
            message,
            postedOn: new Date().toLocaleString('en-GB'),
        };
        // Send to all peers
        webrtc.sendToAll('chat', chatMessage);
        // Update messages locally
        messages.push(chatMessage);
        $('#post-message').val('');
        updateChatMessages();
    };

    // Display Chat Interface
    const showChatRoom = (room) => {
        const html = chatTemplate({
            room
        });
        chatEl.html(html);
        const postForm = $('form');
        postForm.form({
            message: 'empty',
        });
        $('#post-btn').on('click', () => {
            const message = $('#post-message').val();
            postMessage(message);
        });
        $('#post-message').on('keyup', (event) => {
            if (event.keyCode === 13) {
                const message = $('#post-message').val();
                postMessage(message);
            }
        });
    };

    const createRoom = (roomName) => {
        console.info(`Creating new room: ${roomName}`);
        webrtc.createRoom(roomName, (err, name) => {
            showChatRoom(name);
            postMessage(`${username} created chatroom`);
        });
    };

    // Receive message from remote user
    webrtc.connection.on('message', (data) => {
        if (data.type === 'chat') {
            const message = data.payload;
            messages.push(message);
            updateChatMessages();
        }
    });

    $('#unmute').on('click', (event) => {
        $('#unmute').hide();
        $('#mute').show();
        webrtc.mute();

    });

    $('#mute').on('click', (event) => {
        $('#mute').hide();
        $('#unmute').show();
        webrtc.unmute();

    });

    $('#leave').on('click', (event) => {
        webrtc.leaveRoom();
        window.location.href = "https://" + window.location.hostname + ":" + location.port;
    });

    if (type == 0) {
        joinRoom();
    }
    if (type == 1) {
        createRoom(roomName);
    }
});
