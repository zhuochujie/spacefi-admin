# 管理端 API 文档

本文档只整理管理端需要使用的接口。所有金额字段都使用链上最小单位字符串传输，前端不要用 `number` 承接，统一使用 `string` 或 `bigint`。

## 基础约定

### Base URL

开发环境示例：

```txt
http://localhost:3001
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
  "path": "/admin/profile"
}
```

### 鉴权

除登录外，管理端接口都需要带后台 JWT：

```http
Authorization: Bearer <access_token>
```

普通用户钱包登录获得的 JWT 不能访问管理端接口，否则返回 `ADMIN_REQUIRED`。

后台写操作成功后可发送 Telegram 通知。服务端环境变量：

```text
TELEGRAM_BOT_TOKEN=机器人 token
TELEGRAM_CHAT_ID=目标 chat_id
```

通知包含管理员、操作、请求路径和参数。密码、token、secret、signature、privateKey
等敏感字段会自动隐藏。任一变量未配置时不发送通知；Telegram 请求失败不会影响后台操作结果。

## 错误码

| message | HTTP 状态码 | 说明 |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | Token 缺失或 Token 无效 |
| `INVALID_ADMIN_CREDENTIALS` | 401 | 后台用户名或密码错误，或账号已禁用 |
| `INVALID_CURRENT_PASSWORD` | 401 | 当前密码错误，或账号已禁用 |
| `ADMIN_REQUIRED` | 403 | 需要管理员权限 |
| `NEW_PASSWORD_MUST_DIFFER` | 400 | 新密码不能与当前密码相同 |
| `ADMIN_PASSWORD_CHANGED_CONCURRENTLY` | 409 | 密码已被另一个请求修改，需要重新登录后重试 |
| `ACCOUNT_NOT_FOUND` | 404 | 账户不存在 |
| `INVALID_UPDATE_FIELDS` | 400 | 更新字段不能为空 |
| `DIVIDEND_RULE_GROUP_NOT_FOUND` | 404 | 分红规则分组不存在 |
| `DUPLICATE_DIVIDEND_RULE_LEVEL` | 400 | 同组提交了重复 level |
| `INVALID_DIVIDEND_RULE_LEVELS` | 400 | 提交的 level 与该分组不一致 |
| `DIVIDEND_RULE_BP_TOTAL_MUST_EQUAL_10000` | 400 | 同组规则 BP 总和必须等于 10000 |
| `CONFIG_NOT_FOUND` | 404 | 配置不存在 |
| `CONFIG_NOT_ADMIN_EDITABLE` | 400 | 配置不允许后台修改 |
| `INVALID_CONFIG_FORMAT` | 400 | 配置格式错误 |
| `CONFIG_EXCEEDS_LIMIT` | 400 | 配置超过上限 |
| `INVALID_WITHDRAW_FEE_CONFIG` | 400 | 提现手续费配置错误 |
| `NOTICE_NOT_FOUND` | 404 | 公告不存在 |
| `MINER_NOT_FOUND` | 404 | 矿机不存在 |
| `MINER_ALREADY_EXISTS` | 409 | 矿机已存在 |

## 登录流程

管理端使用独立用户名和密码登录，不复用用户钱包账户。

后台登录用户名不存在或密码错误时，会立即禁用全部后台账号，并发送 Telegram
安全通知。锁定后，所有后台账号此前签发的 JWT 都无法继续访问后台接口。恢复账号需要执行：

```sql
UPDATE admin_user SET enabled = true;
```

### 登录

授权：公开。

```http
POST /admin-auth/login
```

请求体：

```json
{
  "username": "admin",
  "password": "your-password"
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

### 修改密码

授权：需要管理员。

```http
PATCH /admin-auth/password
Authorization: Bearer <access_token>
```

请求体：

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

新密码长度为 8 至 128 个字符，并且不能与当前密码相同。

返回：

```json
{
  "data": {
    "success": true
  }
}
```

修改成功后，已经签发的后台 JWT 在到期前仍然有效。

### 校验管理员身份

授权：需要管理员。

```http
GET /admin/profile
```

返回：

```json
{
  "data": {
    "id": 1,
    "username": "admin"
  }
}
```

如果使用普通用户 JWT 或后台账号已禁用：

```json
{
  "success": false,
  "code": 403,
  "message": "ADMIN_REQUIRED",
  "timestamp": 1710000000000,
  "path": "/admin/profile"
}
```

### 初始化后台账号

生产库未开启 `TYPEORM_SYNCHRONIZE` 时，先执行：

```sql
\i sql/create_admin_user.sql
```

首次启动前配置：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=至少8位的强密码
```

服务只会在该用户名不存在时创建账号，不会在后续启动时覆盖已有密码。密码使用 Argon2 哈希存储。首次账号创建完成后，可以从运行环境同时移除 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`。

## 统计

### 今日 SPACE 购买矿机总额

授权：需要管理员。

统计今日 `status = used` 的矿机购买签名 `price` 总和。今日按 `Asia/Shanghai` 自然日计算。

```http
GET /admin/stats/today-miner-purchase-space
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
GET /admin/stats/active-users
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
GET /admin/stats/miners
```

返回：

```json
{
  "data": {
    "count": 300
  }
}
```

### 今晚预估矿机奖励

授权：需要管理员。

按下一个 `Asia/Shanghai` 00:00 发奖时间，预估普通矿机和免费矿机会发放的矿机奖励。不包含团队奖励。

```http
GET /admin/stats/estimated-miner-rewards
```

返回：

```json
{
  "data": {
    "targetTimestamp": 1710086400,
    "accountMiner": {
      "minerCount": 300,
      "accountCount": 120,
      "rewardTotal": "1000000000000000000000"
    },
    "freeMiner": {
      "minerCount": 80,
      "accountCount": 80,
      "rewardTotal": "200000000000000000000"
    },
    "totalReward": "1200000000000000000000"
  }
}
```

## 矿机管理

### 查询矿机列表

授权：需要管理员。

```http
GET /admin/miners
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
      "isPurchasable": true
    }
  ]
}
```

### 新增矿机

授权：需要管理员。

```http
POST /admin/miners
```

请求体：

```json
{
  "id": "SPACE_100",
  "name": "SPACE 100",
  "price": "100000000000000000000",
  "expectedReward": "500000000000000000000",
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
| `desc` | 否 | 描述或 i18n key |
| `isPurchasable` | 否 | 是否可购买，默认 `false` |

### 修改矿机

授权：需要管理员。

```http
PATCH /admin/miners/:minerId
```

请求体：

```json
{
  "name": "SPACE 100",
  "price": "100000000000000000000",
  "expectedReward": "500000000000000000000",
  "desc": "miner.desc.SPACE_100",
  "isPurchasable": true
}
```

说明：所有字段都可选，但至少传一个字段。不能修改矿机 ID。

## 用户管理

### 查询用户列表

授权：需要管理员。

```http
GET /admin/users?page=1&pageSize=20
```

Query：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `page` | 否 | 默认 `1` |
| `pageSize` | 否 | 默认 `20`，最大 `100` |
| `address` | 否 | 钱包地址，支持模糊查询 |
| `refCode` | 否 | 推荐码，支持模糊查询 |
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
GET /admin/notices?page=1&pageSize=20
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
        "thaiTitle": "Notice title",
        "thaiContent": "Notice content",
        "koreanTitle": "Notice title",
        "koreanContent": "Notice content",
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
POST /admin/notices
```

请求体：

```json
{
  "title": "公告标题",
  "content": "公告内容",
  "englishTitle": "Notice title",
  "englishContent": "Notice content",
  "thaiTitle": "Notice title",
  "thaiContent": "Notice content",
  "koreanTitle": "Notice title",
  "koreanContent": "Notice content"
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 中文标题，最大 `200` 字符 |
| `content` | 是 | 中文内容 |
| `englishTitle` | 否 | 英文标题，最大 `200` 字符 |
| `englishContent` | 否 | 英文内容 |
| `thaiTitle` | 否 | 泰文标题，最大 `200` 字符 |
| `thaiContent` | 否 | 泰文内容 |
| `koreanTitle` | 否 | 韩文标题，最大 `200` 字符 |
| `koreanContent` | 否 | 韩文内容 |

返回：

```json
{
  "data": {
    "id": 1,
    "title": "公告标题",
    "content": "公告内容",
    "englishTitle": "Notice title",
    "englishContent": "Notice content",
    "thaiTitle": "Notice title",
    "thaiContent": "Notice content",
    "koreanTitle": "Notice title",
    "koreanContent": "Notice content",
    "createTime": 1710000000
  }
}
```

### 修改公告

授权：需要管理员。

```http
PATCH /admin/notices/:noticeId
```

请求体：

```json
{
  "title": "新的公告标题",
  "content": "新的公告内容",
  "englishTitle": "New notice title",
  "englishContent": "New notice content",
  "thaiTitle": "New notice title",
  "thaiContent": "New notice content",
  "koreanTitle": "New notice title",
  "koreanContent": "New notice content"
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 否 | 中文标题，最大 `200` 字符 |
| `content` | 否 | 中文内容 |
| `englishTitle` | 否 | 英文标题，最大 `200` 字符 |
| `englishContent` | 否 | 英文内容 |
| `thaiTitle` | 否 | 泰文标题，最大 `200` 字符 |
| `thaiContent` | 否 | 泰文内容 |
| `koreanTitle` | 否 | 韩文标题，最大 `200` 字符 |
| `koreanContent` | 否 | 韩文内容 |

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
    "thaiTitle": "New notice title",
    "thaiContent": "New notice content",
    "koreanTitle": "New notice title",
    "koreanContent": "New notice content",
    "createTime": 1710000000
  }
}
```

### 删除公告

授权：需要管理员。

```http
DELETE /admin/notices/:noticeId
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

分红比例使用 BP 表示，`10000` 表示 `100%`。同一个 `category + token` 下，所有规则的 `bp` 总和必须等于 `10000`。

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
GET /admin/dividend-rules
```

返回：

```json
{
  "data": [
    {
      "category": "vip",
      "token": "SPACE",
      "totalBp": 10000,
      "rules": [
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
  ]
}
```

### 修改分红规则

授权：需要管理员。

```http
PATCH /admin/dividend-rules/:category/:token
```

请求体：

```json
{
  "rules": [
    {
      "level": 1,
      "bp": 3000
    },
    {
      "level": 2,
      "bp": 2500
    },
    {
      "level": 3,
      "bp": 2000
    },
    {
      "level": 4,
      "bp": 1500
    },
    {
      "level": 5,
      "bp": 1000
    }
  ]
}
```

说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `rules` | 是 | 该 `category + token` 分组下全部规则 |
| `rules[].level` | 是 | 分红等级 |
| `rules[].bp` | 是 | 分红比例，范围 `0` - `10000` |

必须一次提交该分组下全部 `level`，不能缺失或重复。提交后该分组所有规则 BP 总和必须等于 `10000`。

返回：

```json
{
  "data": {
    "category": "vip",
    "token": "SPACE",
    "totalBp": 10000,
    "rules": [
      {
        "id": 1,
        "category": "vip",
        "token": "SPACE",
        "level": 1,
        "bp": 3000,
        "createdAt": 1710000000,
        "updatedAt": 1710000100
      }
    ]
  }
}
```

## 配置管理

配置管理只允许修改已有配置的 `value`，不支持新增配置。所有配置值都以字符串传输。`isAdminEditable` 表示该配置是否允许后台修改，默认 `false`。

### 查询配置列表

授权：需要管理员。

```http
GET /admin/configs
```

只返回 `isAdminEditable=true` 的配置。

返回：

```json
{
  "data": [
    {
      "key": "TEAM_REWARD_BP",
      "value": "300",
      "desc": "团队奖励比例，单位 BP，10000 表示 100%",
      "isAdminEditable": true
    }
  ]
}
```

默认可修改规则：

| 配置 key | 是否后台可修改 |
| --- | --- |
| `VIP_FEE_BP` | 是 |
| `NODE_FEE_BP` | 是 |
| `INIT_CYCLE_SECONDS` | 否 |
| `MINER_REWARD_START_AT` | 否 |
| `MAX_CYCLE_SECONDS` | 是 |
| `MINER_EXTENDED_PER_CYCLE_SECONDS` | 是 |
| `CYCLE_REWARD_BP` | 是 |
| `FEE_EXEMPT_MIN_NODE_LEVEL` | 是 |
| `USDT_DIVIDEND_FEE_BP` | 是 |
| `COMMISSION_HIGH_MINER_PRICE_WEI` | 否 |
| `TEAM_REWARD_BP` | 是 |
| `VIP_V1_MARKET_THRESHOLD_WEI` | 是 |
| `SPACE_USDT_PRICE_WEI` | 是 |
| `FREE_MINER_PRICE_WEI` | 否 |
| `FREE_MINER_CYCLE_REWARD_BP` | 是 |

### 修改配置

授权：需要管理员。

```http
PATCH /admin/configs/:key
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

如果配置的 `isAdminEditable` 为 `false`，接口返回 `CONFIG_NOT_ADMIN_EDITABLE`。

校验规则：

| 配置类型 | 规则 |
| --- | --- |
| BP 配置 | 最大 `10000` |
| `VIP_FEE_BP` + `NODE_FEE_BP` | 总和不能超过 `10000` |
| `INIT_CYCLE_SECONDS`、`MAX_CYCLE_SECONDS`、`MINER_EXTENDED_PER_CYCLE_SECONDS`、`FEE_EXEMPT_MIN_NODE_LEVEL` | 必须是大于 `0` 的安全整数 |
| `MINER_REWARD_START_AT` | 必须是大于等于 `0` 的安全整数，秒级时间戳，`0` 表示立即开始 |
| `SPACE_USDT_PRICE_WEI` | 必须是大于 `0` 的整数字符串，单位 USDT wei，允许超过 JS 安全整数 |

修改 `CYCLE_REWARD_BP` 时，接口会在同一事务内重算所有未出局付费矿机的 `rewardPerSecond`，免费矿机不受影响。

修改 `VIP_V1_MARKET_THRESHOLD_WEI` 时，接口会在同一事务内执行 `CALL recompute_vip_levels()`，重新计算所有账户的系统 VIP 等级，不影响手动 VIP 等级。

修改 `FREE_MINER_CYCLE_REWARD_BP` 时，接口会在同一事务内重算所有未出局免费矿机的 `rewardPerSecond`，付费矿机不受影响。

返回：

```json
{
  "data": {
    "key": "TEAM_REWARD_BP",
    "value": "500",
    "desc": "团队奖励比例，单位 BP，10000 表示 100%",
    "isAdminEditable": true
  }
}
```

### 查询全部分红记录

授权：需要管理员。

```http
GET /admin/dividend-logs?page=1&pageSize=20
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
GET /admin/users/:accountId/balance-logs?page=1&pageSize=20
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
PATCH /admin/users/:accountId/levels
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
    "balance": "0",
    "usdtBalance": "0",
    "createdAt": 1710000000
  }
}
```

### 查询用户矿机信息

授权：需要管理员。

```http
GET /admin/users/:accountId/miners
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
        "rewardPerSecond": "192901234567901",
        "createdAt": 1710000000,
        "miner": {
          "id": "SPACE_100",
          "name": "SPACE 100",
          "price": "100000000000000000000",
          "desc": "miner.desc.SPACE_100",
          "expectedReward": "500000000000000000000",
          "isPurchasable": false
        }
      }
    ],
    "minerReward": "0",
    "teamReward": "0"
  }
}
```
