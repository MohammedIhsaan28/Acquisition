import { pgTable ,varchar,timestamp, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users',{
  id:serial('id').primaryKey(),
  name: varchar('name',{ length:225}).notNull(),
  email: varchar('email',{ length:225}).notNull().unique(),
  password: varchar('password',{ length:225}).notNull(),
  role: varchar('role',{ length:50}).notNull().default('user'),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),

});