import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("../src/index.html", import.meta.url), "utf8");
const migration = readFileSync(new URL("../migrations/001_init.sql", import.meta.url), "utf8");

describe("browser rendering boundaries", () => {
  it("does not rely on inline handlers or dynamic HTML parsing", () => {
    expect(html).not.toMatch(/\sonclick\s*=/i);
    expect(html).not.toMatch(/\.innerHTML\s*=/);
    expect(html).toContain("addEventListener");
    expect(html).toContain("textContent");
  });

  it("does not accept client-supplied audit identity", () => {
    expect(html).not.toContain("__CURRENT_MEMBER");
    expect(html).not.toMatch(/\bcreated_by\b/);
    expect(html).not.toMatch(/\bmember_id\b/);
  });
});

describe("database integrity", () => {
  it("enforces financial ranges, enums, and parent integrity", () => {
    expect(migration).toMatch(/CHECK\s*\(\s*period IN \('monthly', 'weekly'\)/i);
    expect(migration).toMatch(/amount_cents BETWEEN 1 AND 1000000000000/i);
    expect(migration).toMatch(/limit_cents BETWEEN 0 AND 1000000000000/i);
    expect(migration).toMatch(/FOREIGN KEY \(budget_id\).*ON DELETE SET NULL/is);
  });

  it("indexes transaction history and budget-period lookups", () => {
    expect(migration).toMatch(/transactions_date_idx/i);
    expect(migration).toMatch(/transactions_budget_date_idx/i);
  });

  it("does not expose forgeable audit columns", () => {
    expect(migration).not.toMatch(/\bcreated_by\b/);
    expect(migration).not.toMatch(/\bmember_id\b/);
    expect(migration).not.toMatch(/\bcreated_at\b/);
  });
});
