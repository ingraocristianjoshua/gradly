import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const exams = pgTable('exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  grade: integer('grade').notNull().default(0),
  cfu: integer('cfu').notNull(),
  lode: boolean('lode').notNull().default(false),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const settings = pgTable('settings', {
  sessionId: uuid('session_id').primaryKey().references(() => sessions.id, { onDelete: 'cascade' }),
  thesisPoints: integer('thesis_points').notNull().default(0),
  committeePoints: integer('committee_points').notNull().default(0),
});
