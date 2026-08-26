import { defineConfig } from 'drizzle-kit';
import { DATABASE_URL } from './src/constants.js'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  tablesFilter: '!flyway_schema_history',
  dbCredentials: {
    url: DATABASE_URL!,
  },
});
