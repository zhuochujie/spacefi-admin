const apiMessageText: Record<string, string> = {
  UNAUTHORIZED: '登录已失效，请重新登录。',
  INVALID_ADMIN_CREDENTIALS: '用户名或密码错误，或账号已被禁用。',
  INVALID_CURRENT_PASSWORD: '当前密码错误，或账号已被禁用。',
  ADMIN_REQUIRED: '当前账号没有管理员权限。',
  NEW_PASSWORD_MUST_DIFFER: '新密码不能与当前密码相同。',
  ADMIN_PASSWORD_CHANGED_CONCURRENTLY: '密码已被其他请求修改，请重新登录后重试。',
  ACCOUNT_NOT_FOUND: '账户不存在。',
  INVALID_UPDATE_FIELDS: '没有可更新的字段。',
  DIVIDEND_RULE_GROUP_NOT_FOUND: '分红规则分组不存在。',
  DUPLICATE_DIVIDEND_RULE_LEVEL: '分红规则中存在重复等级。',
  INVALID_DIVIDEND_RULE_LEVELS: '提交的等级与当前分红规则分组不一致。',
  DIVIDEND_RULE_BP_TOTAL_MUST_EQUAL_10000: '分红规则总比例必须等于 100%。',
  CONFIG_NOT_FOUND: '配置不存在。',
  CONFIG_NOT_ADMIN_EDITABLE: '该配置不允许在后台修改。',
  INVALID_CONFIG_FORMAT: '配置值格式错误。',
  CONFIG_EXCEEDS_LIMIT: '配置值超过允许范围。',
  INVALID_WITHDRAW_FEE_CONFIG: '提现手续费配置错误。',
  NOTICE_NOT_FOUND: '公告不存在。',
  MINER_NOT_FOUND: '矿机不存在。',
  MINER_ALREADY_EXISTS: '矿机已存在。',
  VALIDATION_ERROR: '请求参数格式错误。',
  NOT_FOUND: '请求的接口不存在。',
  INTERNAL_SERVER_ERROR: '服务器内部错误，请稍后重试。',
  ORDER_NOT_FOUND: '订单不存在。',
}

export function formatApiMessage(message: unknown, fallback: string): string {
  if (Array.isArray(message)) {
    const translated: string[] = message
      .map((item) => formatApiMessage(item, ''))
      .filter(Boolean)

    return translated.join('；') || fallback
  }

  if (typeof message !== 'string' || !message.trim()) return fallback

  const normalizedMessage = message.trim()
  return apiMessageText[normalizedMessage] ?? normalizedMessage
}
