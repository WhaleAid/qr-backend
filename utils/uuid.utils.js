function extractUUID(url) {
    const uuidPattern = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    const match = url.match(uuidPattern);
    return match ? match[0] : null;
}

module.exports = {
    extractUUID
}