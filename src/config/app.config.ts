// app.config.ts - 应用程序配置

export default () => ({
  // 应用程序端口配置
  port: parseInt(process.env.PORT, 10) || 5999,
  
  // 服务器域名配置
  domain: process.env.DOMAIN || '127.0.0.1:5999',
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '666666',
    database: process.env.DB_DATABASE || 'alpha_server',
  },
  
  // BSC 相关配置
  bsc: {
    // 默认区块扫描间隔 (毫秒)
    scanInterval: 1000,
    // 每次最大扫描区块数量
    maxBlocksPerScan: 100,
    // 贡献度计算系数 (BNB 除以此值得到贡献度)
    contributionFactor: 0.000024,
    // BSCScan API 接口地址
    apiUrl: 'https://api.bscscan.com/api',
    // 合约地址 (需要在环境变量中设置)
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    // API密钥 (需要在环境变量中设置)
    apiKey: process.env.BSCSCAN_API_KEY || '',
  },
  
  // 缓存配置
  cache: {
    // 缓存过期时间 (秒)
    ttl: 3000,
  },
});
