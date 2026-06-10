import React from 'react';
import {type DimensionValue} from 'react-native';
import {HistorySideBar} from '@/features/life-total';
import {CdmgSideBar} from '@/features/commander-damage';
import {CountersSideBar} from '@/features/counters';

/**
 * A sidebar definition. The registry below is the single source of truth for
 * which sidebars exist — add a row here and the slot (width + content), the
 * UtilsSideBar buttons (entries with an `icon`), and key validation all follow.
 */
export type SidebarDef = {
  /** Stable key used by useSidebarState. */
  key: string;
  /** Expanded width inside the PlayerBox. */
  width: DimensionValue;
  /** Ionicons name. When present, the sidebar gets a button in UtilsSideBar. */
  icon?: string;
  /** Renders the sidebar body for a player. */
  render: (playerId: number) => React.ReactNode;
};

export const SIDEBARS: readonly SidebarDef[] = [
  {
    key: 'cdmg',
    width: '30%',
    icon: 'shield',
    render: playerId => <CdmgSideBar playerId={playerId} />,
  },
  {
    key: 'history',
    width: '20%',
    icon: 'time-outline',
    render: playerId => <HistorySideBar playerId={playerId} />,
  },
  {
    // No icon: opened from the CountersTopBar rather than a UtilsSideBar button.
    key: 'counters',
    width: '26%',
    render: playerId => <CountersSideBar playerId={playerId} />,
  },
];

const SIDEBAR_BY_KEY: Record<string, SidebarDef> = Object.fromEntries(
  SIDEBARS.map(sidebar => [sidebar.key, sidebar]),
);

/** Look up a sidebar definition by key. Returns undefined for null/unknown keys. */
export function getSidebar(key: string | null): SidebarDef | undefined {
  return key === null ? undefined : SIDEBAR_BY_KEY[key];
}
