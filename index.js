const Instagram = require('./services/instagram');
const Threads = require('./services/threads');

module.exports = {
    Instagram,
    Threads,
    // Lowercase aliases for backward compatibility
    instagram: Instagram,
    threads: Threads
};