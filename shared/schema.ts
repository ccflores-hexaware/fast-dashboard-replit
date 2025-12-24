import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const fastAssets = pgTable("fast_assets", {
  internalId: serial("internal_id").primaryKey(),
  id: varchar("id", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  kalmAssignee: text("kalm_assignee"),
  onboardingStatus: text("onboarding_status"),
  onboardingDisposition: text("onboarding_disposition"),
  airDisposition: text("air_disposition"),
  maintenanceDisposition: text("maintenance_disposition"),
  lastConnectorDeliveryDate: text("last_connector_delivery_date"),
  maintenanceSLAExpiration: text("maintenance_sla_expiration"),
  technology: text("technology"),
  cmdbStatus: text("cmdb_status"),
  cmdbBeingRetired: text("cmdb_being_retired"),
  cmdbLegalHold: text("cmdb_legal_hold"),
  ticketsOpened: integer("tickets_opened").default(0),
  assetType: text("asset_type"),
  yearOnboarded: integer("year_onboarded"),
  monthOnboarded: text("month_onboarded"),
  assetPOCs: text("asset_pocs"),
  onboardingSchedule: text("onboarding_schedule"),
  entitlementsMissing: text("entitlements_missing"),
  membersMissing: text("members_missing"),
  cisMissing: text("cis_missing"),
  reliesOnCAFederation: text("relies_on_ca_federation"),
  connectorPattern: text("connector_pattern"),
  automationTeam: text("automation_team"),
  nameOfConnector: text("name_of_connector"),
  connectorStatus: text("connector_status"),
  enrollmentStatus: text("enrollment_status"),
  evidenceStatus: text("evidence_status"),
  miSchedule: text("mi_schedule"),
  miLastAIRUpload: text("mi_last_air_upload"),
  miDaysSince: integer("mi_days_since").default(0),
  miDueDate: text("mi_due_date"),
  miOnboardingChangeDate: text("mi_onboarding_change_date"),
  miL2Assignee: text("mi_l2_assignee"),
  miStatus: text("mi_status"),
  attestationKickedOff: text("attestation_kicked_off"),
  attestationComplete: text("attestation_complete"),
  aiLastCandAAttestation: text("ai_last_cand_a_attestation"),
  keychainAttestationKickoffDate: text("keychain_attestation_kickoff_date"),
  aiDaysSince: integer("ai_days_since").default(0),
  aiAttestationDueDate: text("ai_attestation_due_date"),
  aiOnboardingChangeDate: text("ai_onboarding_change_date"),
  aiL2Assignee: text("ai_l2_assignee"),
  aiStatus: text("ai_status"),
  theGap: text("the_gap"),
  comments: text("comments"),
  status: text("status"),
  lastModifiedBy: text("last_modified_by"),
  lastModifiedDate: text("last_modified_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFastAssetSchema = createInsertSchema(fastAssets).omit({
  internalId: true,
  createdAt: true,
});
export const selectFastAssetSchema = createSelectSchema(fastAssets);
export type InsertFastAsset = z.infer<typeof insertFastAssetSchema>;
export type FastAsset = typeof fastAssets.$inferSelect;

export const assetActivity = pgTable("asset_activity", {
  id: serial("id").primaryKey(),
  assetId: varchar("asset_id", { length: 50 }).notNull(),
  text: text("text"),
  field: jsonb("field"),
  modifiedDate: timestamp("modified_date").defaultNow(),
  modifiedBy: text("modified_by").notNull(),
});

export const insertAssetActivitySchema = createInsertSchema(assetActivity).omit({
  id: true,
  modifiedDate: true,
});
export const selectAssetActivitySchema = createSelectSchema(assetActivity);
export type InsertAssetActivity = z.infer<typeof insertAssetActivitySchema>;
export type AssetActivity = typeof assetActivity.$inferSelect;

export const tpiAssets = pgTable("tpi_assets", {
  internalId: serial("internal_id").primaryKey(),
  id: varchar("id", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  cmdbStatus: text("cmdb_status"),
  cmdbBeingRetired: text("cmdb_being_retired"),
  cmdbLegalHold: text("cmdb_legal_hold"),
  affinityGroup: text("affinity_group"),
  btoAlignment: text("bto_alignment"),
  version: text("version"),
  infoSecCritical: text("info_sec_critical"),
  spof: text("spof"),
  applicationTypeFinancial: text("application_type_financial"),
  itOwnerManagedBy: text("it_owner_managed_by"),
  businessOwnerOwnedBy: text("business_owner_owned_by"),
  businessOwnerSME: text("business_owner_sme"),
  supportedBy: text("supported_by"),
  supportSME: text("support_sme"),
  architect: text("architect"),
  owningInternalOrg: text("owning_internal_org"),
  blockFunding: text("block_funding"),
  assetType: text("asset_type"),
  hosted: text("hosted"),
  sox: text("sox"),
  customerFacing: text("customer_facing"),
  sppi: text("sppi"),
  ppiClassification: text("ppi_classification"),
  cotsOrInHouseBuilt: text("cots_or_in_house_built"),
  isSaas: text("is_saas"),
  maintenanceWindow: text("maintenance_window"),
  operationalHours: text("operational_hours"),
  description: text("description"),
  externalFacing: text("external_facing"),
  foundational: text("foundational"),
  defaultTier: text("default_tier"),
  nonDefaultTier1: text("non_default_tier1"),
  nonDefaultTier2: text("non_default_tier2"),
  nonDefaultTier3: text("non_default_tier3"),
  nonDefaultTier4: text("non_default_tier4"),
  assetTier: text("asset_tier"),
  informationClassification: text("information_classification"),
  privilegedAccess: text("privileged_access"),
  appApprModernDelivery: text("app_appr_modern_delivery"),
  cashPaymentSystems: text("cash_payment_systems"),
  nfr9: text("nfr9"),
  nfr10: text("nfr10"),
  keyChainOnboardingStatus: text("key_chain_onboarding_status"),
  multiFactorAuthentication: text("multi_factor_authentication"),
  financialImpact4hrOutage: text("financial_impact_4hr_outage"),
  mdAssetDesignation: text("md_asset_designation"),
  concatinatedBTOandDivision: text("concatinated_bto_and_division"),
  highLevelBTO: text("high_level_bto"),
  itOwnerCommsCheck: text("it_owner_comms_check"),
  businessOwnerCommsCheck: text("business_owner_comms_check"),
  supportedByCommsCheck: text("supported_by_comms_check"),
  assetIdInFAST: text("asset_id_in_fast"),
  assetIdInSchedule: text("asset_id_in_schedule"),
  assetIdInWeeklyStatusReport: text("asset_id_in_weekly_status_report"),
  disposition: text("disposition"),
  connectorStatus: text("connector_status"),
  onboardingStatus: text("onboarding_status"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTpiAssetSchema = createInsertSchema(tpiAssets).omit({
  internalId: true,
  createdAt: true,
});
export const selectTpiAssetSchema = createSelectSchema(tpiAssets);
export type InsertTpiAsset = z.infer<typeof insertTpiAssetSchema>;
export type TpiAsset = typeof tpiAssets.$inferSelect;

export const tpiAssetHistory = pgTable("tpi_asset_history", {
  id: serial("id").primaryKey(),
  tpiAssetId: varchar("tpi_asset_id", { length: 50 }).notNull(),
  name: text("name").notNull(),
  cmdbStatus: text("cmdb_status"),
  cmdbBeingRetired: text("cmdb_being_retired"),
  cmdbLegalHold: text("cmdb_legal_hold"),
  affinityGroup: text("affinity_group"),
  btoAlignment: text("bto_alignment"),
  version: text("version"),
  infoSecCritical: text("info_sec_critical"),
  spof: text("spof"),
  applicationTypeFinancial: text("application_type_financial"),
  itOwnerManagedBy: text("it_owner_managed_by"),
  businessOwnerOwnedBy: text("business_owner_owned_by"),
  businessOwnerSME: text("business_owner_sme"),
  supportedBy: text("supported_by"),
  supportSME: text("support_sme"),
  architect: text("architect"),
  owningInternalOrg: text("owning_internal_org"),
  blockFunding: text("block_funding"),
  assetType: text("asset_type"),
  hosted: text("hosted"),
  sox: text("sox"),
  customerFacing: text("customer_facing"),
  sppi: text("sppi"),
  ppiClassification: text("ppi_classification"),
  cotsOrInHouseBuilt: text("cots_or_in_house_built"),
  isSaas: text("is_saas"),
  maintenanceWindow: text("maintenance_window"),
  operationalHours: text("operational_hours"),
  description: text("description"),
  externalFacing: text("external_facing"),
  foundational: text("foundational"),
  defaultTier: text("default_tier"),
  nonDefaultTier1: text("non_default_tier1"),
  nonDefaultTier2: text("non_default_tier2"),
  nonDefaultTier3: text("non_default_tier3"),
  nonDefaultTier4: text("non_default_tier4"),
  assetTier: text("asset_tier"),
  informationClassification: text("information_classification"),
  privilegedAccess: text("privileged_access"),
  appApprModernDelivery: text("app_appr_modern_delivery"),
  cashPaymentSystems: text("cash_payment_systems"),
  nfr9: text("nfr9"),
  nfr10: text("nfr10"),
  keyChainOnboardingStatus: text("key_chain_onboarding_status"),
  multiFactorAuthentication: text("multi_factor_authentication"),
  financialImpact4hrOutage: text("financial_impact_4hr_outage"),
  mdAssetDesignation: text("md_asset_designation"),
  concatinatedBTOandDivision: text("concatinated_bto_and_division"),
  highLevelBTO: text("high_level_bto"),
  itOwnerCommsCheck: text("it_owner_comms_check"),
  businessOwnerCommsCheck: text("business_owner_comms_check"),
  supportedByCommsCheck: text("supported_by_comms_check"),
  assetIdInFAST: text("asset_id_in_fast"),
  assetIdInSchedule: text("asset_id_in_schedule"),
  assetIdInWeeklyStatusReport: text("asset_id_in_weekly_status_report"),
  disposition: text("disposition"),
  connectorStatus: text("connector_status"),
  onboardingStatus: text("onboarding_status"),
  status: text("status"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
});

export const insertTpiAssetHistorySchema = createInsertSchema(tpiAssetHistory).omit({
  id: true,
});
export const selectTpiAssetHistorySchema = createSelectSchema(tpiAssetHistory);
export type InsertTpiAssetHistory = z.infer<typeof insertTpiAssetHistorySchema>;
export type TpiAssetHistory = typeof tpiAssetHistory.$inferSelect;

export const btoAssets = pgTable("bto_assets", {
  internalId: serial("internal_id").primaryKey(),
  id: varchar("id", { length: 50 }).notNull().unique(),
  higherLevelBTO: text("higher_level_bto"),
  bto: text("bto"),
  division: text("division"),
  concatValue: text("concat_value"),
  owner: text("owner"),
  deadline: text("deadline"),
  status: text("status"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBtoAssetSchema = createInsertSchema(btoAssets).omit({
  internalId: true,
  createdAt: true,
});
export const selectBtoAssetSchema = createSelectSchema(btoAssets);
export type InsertBtoAsset = z.infer<typeof insertBtoAssetSchema>;
export type BtoAsset = typeof btoAssets.$inferSelect;

export const cmdbAssets = pgTable("cmdb_assets", {
  internalId: serial("internal_id").primaryKey(),
  id: varchar("id", { length: 50 }).notNull().unique(),
  configItem: text("config_item"),
  version: text("version"),
  environment: text("environment"),
  status: text("status"),
  owner: text("owner"),
  lastUpdated: text("last_updated"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCmdbAssetSchema = createInsertSchema(cmdbAssets).omit({
  internalId: true,
  createdAt: true,
});
export const selectCmdbAssetSchema = createSelectSchema(cmdbAssets);
export type InsertCmdbAsset = z.infer<typeof insertCmdbAssetSchema>;
export type CmdbAsset = typeof cmdbAssets.$inferSelect;

export const subAssets = pgTable("sub_assets", {
  internalId: serial("internal_id").primaryKey(),
  parentAssetId: varchar("parent_asset_id", { length: 50 }).notNull().references(() => fastAssets.id),
  name: text("name"),
  assetId: text("asset_id"),
  btoAlignment: text("bto_alignment"),
  version: text("version"),
  cmdbStatus: text("cmdb_status"),
  deploymentLifecyclePhase: text("deployment_lifecycle_phase"),
  applicationTypeFinancial: text("application_type_financial"),
  itOwner: text("it_owner"),
  businessOwner: text("business_owner"),
  businessOwnerSme: text("business_owner_sme"),
  supportedBy: text("supported_by"),
  supportSme: text("support_sme"),
  architect: text("architect"),
  division: text("division"),
  blockFundingName: text("block_funding_name"),
  blockFundingOwner: text("block_funding_owner"),
  assessmentCategory: text("assessment_category"),
  deploymentLifecycleStartDate: text("deployment_lifecycle_start_date"),
  assetType: text("asset_type"),
  hosted: text("hosted"),
  sox: text("sox"),
  customerFacing: text("customer_facing"),
  sppi: text("sppi"),
  ppiClassification: text("ppi_classification"),
  foundational: text("foundational"),
  missionCritical: text("mission_critical"),
  businessCritical: text("business_critical"),
  supporting: text("supporting"),
  cotsOrInHouseBuilt: text("cots_or_in_house_built"),
  isSaas: text("is_saas"),
  maintenanceWindow: text("maintenance_window"),
  operationalHours: text("operational_hours"),
  description: text("description"),
  externalFacing: text("external_facing"),
  financialImpact4hrOutage: text("financial_impact_4hr_outage"),
  assetTier: text("asset_tier"),
  informationClassification: text("information_classification"),
  createdAt: timestamp("created_at").defaultNow(),
  lastModifiedBy: text("last_modified_by"),
  lastModifiedDate: text("last_modified_date"),
});

export const insertSubAssetSchema = createInsertSchema(subAssets).omit({
  internalId: true,
  createdAt: true,
});
export const selectSubAssetSchema = createSelectSchema(subAssets);
export type InsertSubAsset = z.infer<typeof insertSubAssetSchema>;
export type SubAsset = typeof subAssets.$inferSelect;
