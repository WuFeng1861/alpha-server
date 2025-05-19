"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 5999,
    domain: process.env.DOMAIN || '127.0.0.1:5999',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '666666',
        database: process.env.DB_DATABASE || 'alpha_server',
    },
    bsc: {
        scanInterval: 1000,
        maxBlocksPerScan: 100,
        contributionFactor: 0.000024,
        apiUrl: 'https://api.bscscan.com/api',
        contractAddress: process.env.CONTRACT_ADDRESS || '',
        apiKey: process.env.BSCSCAN_API_KEY || '',
    },
    cache: {
        ttl: 3000,
    },
});
//# sourceMappingURL=app.config.js.map