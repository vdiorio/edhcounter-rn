# sidebar-shell

The sliding per-player sidebar shell: a registry of sidebars, the slot that
renders the active one, and the utility buttons that open them.

## Public API (`index.ts`)

- `SIDEBARS`, `getSidebar`, `SidebarDef` — the **registry** is the single source
  of truth for which sidebars exist. Each entry has a `key`, expanded `width`,
  optional Ionicons `icon` (entries with an icon get a `UtilsSideBar` button),
  and a `render(playerId)`. Add a row to add a sidebar.
- `SidebarSlot` — renders the currently selected sidebar for a player.
- `UtilsSideBar` — the column of icon buttons that toggle icon-bearing sidebars.
- `SidebarButton` — a single toggle button.
- `useSidebarState` (+ `SIDEBAR_EXIT_MS`, `resetAllSidebars`) — which sidebar is
  open for a player, with open/close/exit timing.

## Notes

Sidebar keys are plain strings validated against the registry — there is no
`SidebarKey` union. The `counters` sidebar has no icon: it is opened from the
counters top bar rather than a utility button.
