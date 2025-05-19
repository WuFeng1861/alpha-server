# API 文档

## 概述

此 API 文档描述了从 BSC 区块链获取交易数据，计算用户贡献度的接口。

## 基础信息

- 基础URL: `http://127.0.0.1:5999/api`
- 所有接口返回 JSON 格式数据

## 接口列表

### 1. 获取用户已领取贡献度

获取指定地址的已领取贡献度（已领取贡献度是指合约地址往地址转出的 BNB 数量/0.000024）。

**请求**:
- 方法: `GET`
- URL: `/contribution/:address`
- 参数:
  - `address`: 用户的以太坊地址

**响应**:
```json
{
  "address": "0x123...",
  "contribution": 1234.56
}
```

### 2. 刷新用户贡献度缓存

刷新指定用户的贡献度缓存。

**请求**:
- 方法: `POST`
- URL: `/contribution/refresh/:address`
- 参数:
  - `address`: 用户的以太坊地址

**响应**:
```json
{
  "address": "0x123...",
  "contribution": 1234.56
}
```

### 3. 刷新所有用户贡献度缓存

刷新所有用户的贡献度缓存。

**请求**:
- 方法: `POST`
- URL: `/contribution/refresh-all`

**响应**:
```json
{
  "success": true,
  "message": "已开始刷新所有用户贡献度缓存"
}
```

### 4. 获取用户收到的所有交易

获取某个地址从合约收到的所有 BNB 交易。

**请求**:
- 方法: `GET`
- URL: `/bscscan/transactions/:address`
- 参数:
  - `address`: 用户的以太坊地址

**响应**:
```json
[
  {
    "id": 1,
    "hash": "0x123...",
    "blockNumber": 12345678,
    "timestamp": "2023-01-01T00:00:00Z",
    "fromAddress": "0xContractAddress",
    "toAddress": "0x123...",
    "value": 0.01,
    "createdAt": "2023-01-01T00:01:00Z"
  },
  ...
]
```

### 5. 获取用户收到的 BNB 总量

获取某个地址从合约收到的 BNB 总量。
该接口会返回用户在最新区块高度时的 BNB 总量。

**请求**:
- 方法: `GET`
- URL: `/bscscan/total-bnb/:address`
- 参数:
  - `address`: 用户的以太坊地址

**响应**:
```json
{
  "address": "0x123...",
  "totalBnb": 0.123
}
```

## 使用示例

### 使用 curl 获取用户贡献度

```bash
curl http://127.0.0.1:5999/api/contribution/0x123...
```

### 使用 JavaScript 获取用户贡献度

```javascript
async function getUserContribution(address) {
  const response = await fetch(`http://127.0.0.1:5999/api/contribution/${address}`);
  const data = await response.json();
  console.log(`用户 ${address} 的贡献度为: ${data.contribution}`);
}
```

## 错误处理

所有 API 在遇到错误时会返回适当的 HTTP 状态码和错误信息:

```json
{
  "statusCode": 400,
  "message": "错误描述",
  "error": "错误类型"
}
```

常见状态码:
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误