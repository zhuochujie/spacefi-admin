import type { UserFilters as UserFiltersState } from '../../hooks/useAdminData'

type UserFiltersProps = {
  value: UserFiltersState
  onChange: (next: UserFiltersState) => void
  onSearch: () => void
}

export function UserFilters({ value, onChange, onSearch }: UserFiltersProps) {
  return (
    <form
      className="toolbar"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="field compact">
        <label htmlFor="address-filter">地址</label>
        <input
          id="address-filter"
          value={value.address}
          onChange={(event) => onChange({ ...value, address: event.target.value, page: 1 })}
          placeholder="模糊查询"
        />
      </div>
      <div className="field compact">
        <label htmlFor="vip-filter">VIP等级</label>
        <input
          id="vip-filter"
          value={value.vipLevel}
          onChange={(event) => onChange({ ...value, vipLevel: event.target.value, page: 1 })}
          placeholder="等级"
        />
      </div>
      <div className="field compact">
        <label htmlFor="node-filter">节点等级</label>
        <input
          id="node-filter"
          value={value.nodeLevel}
          onChange={(event) => onChange({ ...value, nodeLevel: event.target.value, page: 1 })}
          placeholder="等级"
        />
      </div>
      <div className="field compact toolbar-action">
        <label aria-hidden="true">&nbsp;</label>
        <button type="submit" className="primary">
          查询
        </button>
      </div>
    </form>
  )
}
