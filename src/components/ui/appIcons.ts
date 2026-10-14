import type { ComponentType } from "react";
import {
  IconAdjustmentsHorizontal, IconArrowBackUp, IconArrowLeft, IconArrowRight,
  IconArrowsExchange, IconBell, IconBook2, IconBookmark, IconCalendar,
  IconCategory, IconCheck, IconChevronDown, IconChevronRight,
  IconCircleX, IconClipboardList, IconDots, IconExternalLink,
  IconEye, IconEyeOff, IconFilter, IconFolder, IconHeart, IconHelpCircle,
  IconHistory, IconHome, IconInfoCircle, IconLink, IconLock, IconMinus,
  IconPencil, IconPlus, IconPuzzle, IconRefresh, IconSearch, IconSettings,
  IconShieldCheck, IconSortAscending, IconTrash, IconUser, IconUsers,
  IconWand, IconWorld, IconX, IconAlertTriangle, IconDeviceFloppy,
} from "@tabler/icons-react";

/**
 * Frontend-only semantic icon vocabulary.
 * Use a semantic meaning here, not an icon's implementation name, throughout app UI.
 * Reserved custom artwork remains out of this registry until approved SVG assets exist.
 */
export const appIcons = {
  home: IconHome,
  catalog: IconCategory,
  profile: IconUser,
  tools: IconWand,
  quiz: IconClipboardList,
  education: IconBook2,
  scenes: IconPuzzle,
  compare: IconArrowsExchange,
  search: IconSearch,
  filter: IconFilter,
  sort: IconSortAscending,
  refine: IconAdjustmentsHorizontal,
  edit: IconPencil,
  save: IconDeviceFloppy,
  add: IconPlus,
  remove: IconMinus,
  delete: IconTrash,
  favorite: IconHeart,
  bookmark: IconBookmark,
  collection: IconFolder,
  expand: IconChevronDown,
  details: IconChevronRight,
  undo: IconArrowBackUp,
  reset: IconRefresh,
  more: IconDots,
  close: IconX,
  confirm: IconCheck,
  help: IconHelpCircle,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  error: IconCircleX,
  back: IconArrowLeft,
  next: IconArrowRight,
  external: IconExternalLink,
  copyLink: IconLink,
  hide: IconEyeOff,
  show: IconEye,
  private: IconLock,
  shared: IconUsers,
  public: IconWorld,
  verifiedSecurity: IconShieldCheck,
  settings: IconSettings,
  notifications: IconBell,
  calendar: IconCalendar,
  history: IconHistory,
} as const satisfies Record<string, ComponentType<any>>;

export type AppIconMeaning = keyof typeof appIcons;
export const appIconDefaults = { size: 22, stroke: 1.65 } as const;
