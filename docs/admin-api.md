# 管理端 API 文档

本文档只整理管理端需要使用的接口。所有金额字段都使用链上最小单位字符串传输，前端不要用 `number` 承接，统一使用 `string` 或 `bigint`。

## 基础约定

### Base URL

开发环境示例：

```txt
http://localhost:3000
```

### 统一响应

成功响应：

```json
{
  "success": true,
  "code": 200,
  "data": {},
  "message": "Success",
  "timestamp": 1710000000000
}
```

失败响应：

```json
{
  "success": false,
  "code": 403,
  "message": "ADMIN_REQUIRED",
  "timestamp": 1710000000000,
  "path": "/nzpunvnojj/profile"
}
```

### 鉴权

除获取 nonce、登录外，管理端接口都需要带 JWT：

```http
Authorization: Bearer <access_token>
```

管理端接口还要求当前登录账户是管理员，否则返回 `ADMIN_REQUIRED`。

## 错误码

| message | HTTP 状态码 | 说明 |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | 未登录、Token 缺失、Token 无效或账户不存在 |
| `INVALID_SIGNATURE` | 401 | 钱包签名校验失败 |
| `NONCE_NOT_FOUND` | 401 / 404 | Nonce 不存在或已失效 |
| `ADMIN_REQUIRED` | 403 | 需要管理员权限 |
| `ACCOUNT_NOT_FOUND` | 404 | 账户不存在 |
| `INVALID_UPDATE_FIELDS` | 400 | 更新字段不能为空 |
| `DIVIDEND_RULE_NOT_FOUND` | 404 | 分红规则不存在 |
| `DIVIDEND_RULE_BP_EXCEEDS_LIMIT` | 400 | 同组规则 BP 总和超过 10000 |
| `CONFIG_NOT_FOUND` | 404 | 配置不存在 |
| `INVALID_CONFIG_FORMAT` | 400 | 配置格式错误 |
| `CONFIG_EXCEEDS_LIMIT` | 400 | 配置超过上限 |
| `INVALID_WITHDRAW_FEE_CONFIG` | 400 | 提现手续费配置错误 |
| `NOTICE_NOT_FOUND` | 404 | 公告不存在 |
| `MINER_NOT_FOUND` | 404 | 矿机不存在 |
| `MINER_ALREADY_EXISTS` | 409 | 矿机已存在 |

## 登录流程

管理端登录复用钱包登录接口。登录成功后，前端需要再调用 `/nzpunvnojj/profile` 判断当前账户是否具备管理员权限。

### 获取 Nonce

授权：公开。

```http
GET /nonce/:address
```

参数：

| 参数 | 位置 | 说明 |
| --- | --- | --- |
| `address` | path | 钱包地址 |

返回：

```json
{
  "data": "nonce字符串"
}
```

### 钱包签名

前端使用钱包对以下消息签名：

```txt
Sign this message to login your account.

Address: <address>
Nonce: <nonce>
```

说明：

| 字段 | 说明 |
| --- | --- |
| `address` | 当前登录钱包地址 |
| `nonce` | 上一步接口返回的 nonce |

### 登录

授权：公开。

```http
POST /auth/login
```

请求体：

```json
{
  "address": "0x...",
  "signature": "0x..."
}
```

返回：

```json
{
  "data": {
    "access_token": "jwt"
  }
}
```

### 校验管理员身份

授权：需要管理员。

```http
GET /nzpunvnojj/profile
```

返回：

```json
{
  "data": {
    "id": 1,
    "address": "0x...",
    "isAdmin": true
  }
}
```

如果当前账户不是管理员：

```json
{
  "success": false,
  "code": 403,
  "message": "ADMIN_REQUIRED",
  "timestamp": 1710000000000,
  "path": "/nzpunvnojj/profile"
}
```

## 统计

### 今日 SPACE 购买矿机总额

授权：需要管理员。

统计今日 `status = used` 的矿机购买签名 `price` 总和。今日按 `Asia/Shanghai` 自然日计算。

```http
GET /nzpunvnojj/stats/today-miner-purchase-space
```

返回：

```json
{
  "data": {
    "amount": "3000000000000000000000",
    "startAt": 1710000000,
    "endAt": 1710086400
  }
}
```

### 有效用户数量

授权：需要管理员。

有矿机的用户视为有效用户。

```http
GET /nzpunvnojj/stats/active-users
```

返回：

```json
{
  "data": {
    "count": 100
  }
}
```

### 总矿机数量

授权：需要管理员。

统计用户拥有的矿机总数。

```http
GET /nzpunvnojj/stats/miners
```

返回：

```json
{
  "data": {
    "count": 300
  }
}
```

### 当前挂单 SPACE 数量

授权：需要管理员。

统计当前 `open` 且 `visible = true` 的买单和卖单剩余 SPACE 数量。

```http
GET /nzpunvnojj/stats/market-open-space
```

返回：

```json
{
  "data": {
    "buySpaceAmount": "1000000000000000000000",
    "sellSpaceAmount": "2000000000000000000000"
  }
}
```

### 今日成交量和成交额

授权：需要管理员。

统计今日市场成交记录。今日按 `Asia/Shanghai` 自然日计算。

```http
GET /nzpunvnojj/stats/today-market-trades
```

返回：

```json
{
  "data": {
    "spaceVolume": "1000000000000000000000",
    "tradingVolume": "500000000000000000000",
    "tradeCount": "10",
    "startAt": 1710000000,
    "endAt": 1710086400
  }
}
```

## 矿机管理

### 查询矿机列表

授权：需要管理员。

```http
GET /nzpunvnojj/miners
```

返回：

```json
{
  "data": [
    {
      "id": "SPACE_100",
      "name": "SPACE 100",
      "price": "100000000000000000000",
      "desc": "miner.desc.SPACE_100",
      "expectedReward": "500000000000000000000",
      "remainingQuantity": 1000,
      "isPurchasable": true
    }
  ]
}
```

### 新增矿机

授权：需要管理员。

```http
POST /nzpunvnojj/miners
```

请求体：

```json
{
  "id": "SPACE_100",
  "name": "SPACE 100",
  "price": "100000000000000000000",
  "expectedReward": "500000000000000000000",
  "remainingQuantity": 1000,
  "desc": "miner.desc.SPACE_100",
  "isPurchasable": true
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 矿机 ID |
| `name` | 是 | 矿机名称 |
| `price` | 是 | 价格，最小单位字符串 |
| `expectedReward` | 是 | 预期奖励，最小单位字符串 |
| `remainingQuantity` | 是 | 剩余数量 |
| `desc` | 否 | 描述或 i18n key |
| `isPurchasable` | 否 | 是否可购买，默认 `false` |

### 修改矿机

授权：需要管理员。

```http
PATCH /nzpunvnojj/miners/:minerId
```

请求体：

```json
{
  "name": "SPACE 100",
  "price": "100000000000000000000",
  "expectedReward": "500000000000000000000",
  "remainingQuantity": 1000,
  "desc": "miner.desc.SPACE_100",
  "isPurchasable": true
}
```

说明：所有字段都可选，但至少传一个字段。不能修改矿机 ID。

## 用户管理

### 查询用户列表

授权：需要管理员。

```http
GET /nzpunvnojj/users?page=1&pageSize=20
```

Query：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `page` | 否 | 默认 `1` |
| `pageSize` | 否 | 默认 `20`，最大 `100` |
| `address` | 否 | 钱包地址，支持模糊查询 |
| `refCode` | 否 | 推荐码，支持模糊查询 |
| `isAdmin` | 否 | 是否管理员 |
| `vipLevel` | 否 | VIP 等级 |
| `nodeLevel` | 否 | 节点等级 |
| `sortBy` | 否 | 排序字段，默认 `createdAt` |
| `sortOrder` | 否 | `ASC` 或 `DESC`，默认 `DESC` |

`sortBy` 可选值：

| 值 | 说明 |
| --- | --- |
| `id` | 用户 ID |
| `createdAt` | 创建时间 |
| `balance` | SPACE 余额 |
| `usdtBalance` | USDT 余额 |
| `vipLevel` | VIP 等级 |
| `manualVipLevel` | 手动 VIP 等级 |
| `nodeLevel` | 节点等级 |
| `teamCount` | 团队人数 |
| `teamPerformance` | 团队业绩 |

返回：

```json
{
  "data": {
    "list": [
      {
        "id": 1,
        "address": "0x...",
        "refCode": "ABCDEFGH",
        "vipLevel": 0,
        "manualVipLevel": 0,
        "balance": "0",
        "usdtBalance": "0",
        "nodeLevel": 0,
        "isAdmin": false,
        "createdAt": 1710000000,
        "teamCount": 10,
        "teamPerformance": "3000000000000000000000"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

## 公告管理

### 查询公告列表

授权：需要管理员。

```http
GET /nzpunvnojj/notices?page=1&pageSize=20
```

Query：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `page` | 否 | 默认 `1` |
| `pageSize` | 否 | 默认 `20`，最大 `100` |

返回：

```json
{
  "data": {
    "list": [
      {
        "id": 1,
        "title": "公告标题",
        "content": "公告内容",
        "englishTitle": "Notice title",
        "englishContent": "Notice content",
        "createTime": 1710000000
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### 创建公告

授权：需要管理员。

```http
POST /nzpunvnojj/notices
```

请求体：

```json
{
  "title": "公告标题",
  "content": "公告内容",
  "englishTitle": "Notice title",
  "englishContent": "Notice content"
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 中文标题，最大 `200` 字符 |
| `content` | 是 | 中文内容 |
| `englishTitle` | 否 | 英文标题，最大 `200` 字符 |
| `englishContent` | 否 | 英文内容 |

返回：

```json
{
  "data": {
    "id": 1,
    "title": "公告标题",
    "content": "公告内容",
    "englishTitle": "Notice title",
    "englishContent": "Notice content",
    "createTime": 1710000000
  }
}
```

### 修改公告

授权：需要管理员。

```http
PATCH /nzpunvnojj/notices/:noticeId
```

请求体：

```json
{
  "title": "新的公告标题",
  "content": "新的公告内容",
  "englishTitle": "New notice title",
  "englishContent": "New notice content"
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 否 | 中文标题，最大 `200` 字符 |
| `content` | 否 | 中文内容 |
| `englishTitle` | 否 | 英文标题，最大 `200` 字符 |
| `englishContent` | 否 | 英文内容 |

至少传一个字段，否则返回 `INVALID_UPDATE_FIELDS`。

返回：

```json
{
  "data": {
    "id": 1,
    "title": "新的公告标题",
    "content": "新的公告内容",
    "englishTitle": "New notice title",
    "englishContent": "New notice content",
    "createTime": 1710000000
  }
}
```

### 删除公告

授权：需要管理员。

```http
DELETE /nzpunvnojj/notices/:noticeId
```

返回：

```json
{
  "data": {
    "id": 1
  }
}
```

## 分红规则管理

分红比例使用 BP 表示，`10000` 表示 `100%`。同一个 `category + token` 下，所有规则的 `bp` 总和不能超过 `10000`。

规则类型：

| category | 说明 | level 范围 |
| --- | --- | --- |
| `vip` | VIP 分红规则 | `1` - `5` |
| `node` | 节点分红规则 | `1` - `4` |

Token：

| token | 说明 |
| --- | --- |
| `SPACE` | SPACE |
| `USDT` | USDT |

### 查询分红规则

授权：需要管理员。

```http
GET /nzpunvnojj/dividend-rules
```

返回：

```json
{
  "data": [
    {
      "id": 1,
      "category": "vip",
      "token": "SPACE",
      "level": 1,
      "bp": 3000,
      "createdAt": 1710000000,
      "updatedAt": 1710000000
    }
  ]
}
```

### 修改分红规则

授权：需要管理员。

```http
PATCH /nzpunvnojj/dividend-rules/:ruleId
```

请求体：

```json
{
  "bp": 1200
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `bp` | 是 | 分红比例，范围 `0` - `10000` |

只能修改 `bp`。修改后如果同一个 `category + token` 下规则 BP 总和超过 `10000`，返回 `DIVIDEND_RULE_BP_EXCEEDS_LIMIT`。

返回：

```json
{
  "data": {
    "id": 10,
    "category": "node",
    "token": "USDT",
    "level": 4,
    "bp": 1200,
    "createdAt": 1710000000,
    "updatedAt": 1710000100
  }
}
```

## 配置管理

配置管理只允许修改已有配置的 `value`，不支持新增配置。所有配置值都以字符串传输。

### 查询配置列表

授权：需要管理员。

```http
GET /nzpunvnojj/configs
```

返回：

```json
{
  "data": [
    {
      "key": "TEAM_REWARD_BP",
      "value": "300",
      "desc": "团队奖励比例，单位 BP，10000 表示 100%"
    }
  ]
}
```

### 修改配置

授权：需要管理员。

```http
PATCH /nzpunvnojj/configs/:key
```

请求体：

```json
{
  "value": "500"
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `value` | 是 | 配置值字符串，目前只允许非负整数字符串 |

校验规则：

| 配置类型 | 规则 |
| --- | --- |
| BP 配置 | 最大 `10000` |
| `VIP_FEE_BP` + `NODE_FEE_BP` | 总和不能超过 `10000` |
| 周期、延长次数、免手续费等级配置 | 必须是大于 `0` 的安全整数 |

返回：

```json
{
  "data": {
    "key": "TEAM_REWARD_BP",
    "value": "500",
    "desc": "团队奖励比例，单位 BP，10000 表示 100%"
  }
}
```

### 查询全部分红记录

授权：需要管理员。

```http
GET /nzpunvnojj/dividend-logs?page=1&pageSize=20
```

Query：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `page` | 否 | 默认 `1` |
| `pageSize` | 否 | 默认 `20`，最大 `100` |

返回：

```json
{
  "data": {
    "list": [
      {
        "id": 1,
        "accountId": 1,
        "type": "vip_dividend",
        "token": "SPACE",
        "amount": "1000000000000000000",
        "balanceBefore": "0",
        "balanceAfter": "1000000000000000000",
        "createdAt": 1710000000,
        "account": {
          "id": 1,
          "address": "0x...",
          "refCode": "ABCDEFGH",
          "vipLevel": 1,
          "manualVipLevel": 0,
          "balance": "1000000000000000000",
          "usdtBalance": "0",
          "nodeLevel": 0,
          "isAdmin": false,
          "createdAt": 1710000000
        }
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### 查询用户资金记录

授权：需要管理员。

```http
GET /nzpunvnojj/users/:accountId/balance-logs?page=1&pageSize=20
```

Path：

| 参数 | 说明 |
| --- | --- |
| `accountId` | 用户 ID |

Query：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `page` | 否 | 默认 `1` |
| `pageSize` | 否 | 默认 `20`，最大 `100` |
| `type` | 否 | 资金记录类型，支持逗号分隔或数组 |
| `token` | 否 | `SPACE` 或 `USDT` |

`type` 可选值：

| 值 | 说明 |
| --- | --- |
| `miner_reward` | 矿机奖励 |
| `team_reward` | 团队奖励 |
| `miner_purchase` | 购买矿机 |
| `miner_purchase_refund` | 购买矿机退款 |
| `withdraw` | 提现 |
| `withdraw_refund` | 提现退款 |
| `vip_dividend` | VIP 分红 |
| `node_dividend` | 节点分红 |

返回：

```json
{
  "data": {
    "list": [
      {
        "id": 1,
        "accountId": 1,
        "type": "miner_reward",
        "token": "SPACE",
        "amount": "1000000000000000000",
        "balanceBefore": "0",
        "balanceAfter": "1000000000000000000",
        "createdAt": 1710000000
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### 修改用户等级

授权：需要管理员。

```http
PATCH /nzpunvnojj/users/:accountId/levels
```

请求体：

```json
{
  "manualVipLevel": 3,
  "nodeLevel": 4
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `manualVipLevel` | 否 | 手动 VIP 等级，范围 `0` - `5` |
| `nodeLevel` | 否 | 节点等级，范围 `0` - `4` |

至少传一个字段，否则返回 `INVALID_UPDATE_FIELDS`。

返回：

```json
{
  "data": {
    "id": 1,
    "address": "0x...",
    "refCode": "ABCDEFGH",
    "vipLevel": 0,
    "manualVipLevel": 3,
    "nodeLevel": 4,
    "isAdmin": false,
    "balance": "0",
    "usdtBalance": "0",
    "createdAt": 1710000000
  }
}
```

### 查询用户矿机信息

授权：需要管理员。

```http
GET /nzpunvnojj/users/:accountId/miners
```

Path：

| 参数 | 说明 |
| --- | --- |
| `accountId` | 用户 ID |

返回：

```json
{
  "data": {
    "list": [
      {
        "id": 1,
        "minerId": "SPACE_100",
        "accountId": 1,
        "expectedReward": "500000000000000000000",
        "producedReward": "0",
        "cycle": 30,
        "cycleEndAt": 1710000000,
        "lastRewardAt": 1710000000,
        "globalExtendedTime": 0,
        "rewardPerSecond": "192901234567901",
        "createdAt": 1710000000,
        "miner": {
          "id": "SPACE_100",
          "name": "SPACE 100",
          "price": "100000000000000000000",
          "desc": "miner.desc.SPACE_100",
          "expectedReward": "500000000000000000000",
          "remainingQuantity": 1000,
          "isPurchasable": false
        }
      }
    ],
    "minerReward": "0",
    "teamReward": "0"
  }
}
```
