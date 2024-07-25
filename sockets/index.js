module.exports = (io) => {
    io.on('connect', (socket) => {
        console.log('User connected', socket.id);

        socket.on('disconnect', (reason) => {
            console.log('User disconnected', socket.id, 'Reason:', reason);
        });

        socket.on('error', (error) => {
            console.error('Socket error', error);
        });
    });
}