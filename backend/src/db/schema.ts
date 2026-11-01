import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const merchants = pgTable("merchants", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  upiId: varchar("upi_id", { length: 255 }),
  apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentRequests = pgTable("payment_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  orderId: varchar("order_id", { length: 255 }).notNull(),
  amountPaise: integer("amount_paise").notNull(),
  upiId: varchar("upi_id", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  upiLink: text("upi_link").notNull(),
  qrCode: text("qr_code").notNull(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  utr: varchar("utr", { length: 30 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const merchantsRelations = relations(merchants, ({ many }) => ({
  paymentRequests: many(paymentRequests),
}));

export const paymentRequestsRelations = relations(paymentRequests, ({ one }) => ({
  merchant: one(merchants, {
    fields: [paymentRequests.merchantId],
    references: [merchants.id],
  }),
}));

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type NewPaymentRequest = typeof paymentRequests.$inferInsert;
