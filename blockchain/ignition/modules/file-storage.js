// ignition/file-storage.js
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('FileStorageModule', (m) => {
    const fileStorage = m.contract('FileStorage',[],{});
    return { fileStorage };
});
