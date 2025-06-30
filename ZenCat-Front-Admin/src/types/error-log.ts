// Error Log specific types - Re-exports from audit.ts for clarity
export type {
  ErrorLog,
  ErrorLogFilters,
  ErrorLogStats,
  AuditAction,
  AuditEntityType,
  ActionBadgeConfig,
  EntityBadgeConfig,
} from './audit';

export {
  ACTION_CONFIGS,
  ENTITY_CONFIGS,
  getActionConfig,
  getEntityConfig,
  mapAuditLogFromBackend,
} from './audit';
