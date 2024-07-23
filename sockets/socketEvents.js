let io;

const initSocket = (ioInstance) => {
    io = ioInstance;
};

const emitSocket = (event, data) => {
    if (!io) {
        console.error('Socket.io instance not initialized');
        return;
    }
    io.emit(event, data);
};

module.exports = {
    initSocket,
    emitSocket
};
