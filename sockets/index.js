module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    io.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });
}