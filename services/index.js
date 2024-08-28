const sessions = {};

exports.sessions = sessions;

exports.getSession = (sessionId) => {
    const session = sessions[sessionId];
    return session && session.valid ? session : null;
};

exports.invalidateSession = (sessionId) => {
    if (sessions[sessionId]) {
        sessions[sessionId].valid = false;
    }
    return sessions[sessionId];
};

exports.createSession = (email) => {
    const sessionId = Math.random().toString(36).slice(2);
    const session = {
        sessionId,
        email,
        valid: true
    };
    sessions[sessionId] = session;
    return session;
};
