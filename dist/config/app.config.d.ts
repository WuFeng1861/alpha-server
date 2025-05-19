declare const _default: () => {
    port: number;
    domain: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    bsc: {
        scanInterval: number;
        maxBlocksPerScan: number;
        contributionFactor: number;
        apiUrl: string;
        contractAddress: string;
        apiKey: string;
    };
    cache: {
        ttl: number;
    };
};
export default _default;
