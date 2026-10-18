/**
 * Minimal in-memory stand-in for the PostgREST query builder used by
 * supabase-js. Each awaited statement is applied in a single synchronous step,
 * which mirrors how Postgres executes one UPDATE/INSERT atomically — enough to
 * exercise compare-and-swap logic under concurrent requests.
 */
export type Row = Record<string, unknown>;

interface QueryResult {
  data: unknown;
  error: { code: string; message: string } | null;
  count?: number | null;
}

type Operation = 'select' | 'insert' | 'update' | 'delete' | 'upsert';
type Filter = (row: Row) => boolean;

export interface FakeSupabaseOptions {
  /** Column that must be unique per table (simulates PK / UNIQUE constraints). */
  uniqueKeys?: Record<string, string>;
}

export class FakeQuery implements PromiseLike<QueryResult> {
  private readonly filters: Filter[] = [];
  private operation: Operation = 'select';
  private payload: Row | Row[] | null = null;
  private returning = false;
  private mode: 'many' | 'single' | 'maybeSingle' = 'many';
  private countOnly = false;

  constructor(
    private readonly db: FakeSupabase,
    private readonly table: string,
  ) {}

  select(_columns?: string, options?: { count?: string; head?: boolean }): this {
    if (this.operation !== 'select') this.returning = true;
    this.countOnly = Boolean(options?.count && options.head);
    return this;
  }

  insert(payload: Row | Row[]): this {
    this.operation = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: Row): this {
    this.operation = 'update';
    this.payload = payload;
    return this;
  }

  upsert(payload: Row | Row[]): this {
    this.operation = 'upsert';
    this.payload = payload;
    return this;
  }

  delete(): this {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  is(column: string, value: null): this {
    this.filters.push((row) => (row[column] ?? null) === value);
    return this;
  }

  lt(column: string, value: number): this {
    this.filters.push((row) => Number(row[column]) < value);
    return this;
  }

  gte(column: string, value: number): this {
    this.filters.push((row) => Number(row[column]) >= value);
    return this;
  }

  ilike(column: string, pattern: string): this {
    const regex = new RegExp(`^${pattern.replace(/%/g, '.*')}$`, 'i');
    this.filters.push(
      (row) => typeof row[column] === 'string' && regex.test(row[column] as string),
    );
    return this;
  }

  or(expr: string): this {
    const clauses = expr.split(',').map((part) => part.trim().split('.'));
    this.filters.push((row) =>
      clauses.some(([col, op, val]) => {
        const rowVal = String(row[col] ?? '');
        if (op === 'eq') return rowVal.toLowerCase() === (val ?? '').toLowerCase();
        if (op === 'ilike') {
          const reg = new RegExp(`^${(val ?? '').replace(/%/g, '.*')}$`, 'i');
          return reg.test(rowVal);
        }
        return false;
      }),
    );
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  order(): this {
    return this;
  }

  limit(): this {
    return this;
  }

  single(): this {
    this.mode = 'single';
    return this;
  }

  maybeSingle(): this {
    this.mode = 'maybeSingle';
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve()
      .then(() => this.execute())
      .then(onfulfilled, onrejected);
  }

  private execute(): QueryResult {
    if (this.operation !== 'select' && this.db.isFailingWrites(this.table)) {
      return { data: null, error: { code: 'XX000', message: 'forced write failure' } };
    }

    const rows = this.db.rows(this.table);
    const matches = rows.filter((row) => this.filters.every((f) => f(row)));

    switch (this.operation) {
      case 'insert':
        return this.applyInsert(rows);
      case 'upsert':
        return this.applyUpsert(rows);
      case 'update':
        for (const row of matches) Object.assign(row, this.payload);
        return this.shape(this.returning ? matches : null);
      case 'delete':
        this.db.setRows(
          this.table,
          rows.filter((row) => !matches.includes(row)),
        );
        return this.shape(this.returning ? matches : null);
      default:
        if (this.countOnly) return { data: null, error: null, count: matches.length };
        return this.shape(matches);
    }
  }

  private applyInsert(rows: Row[]): QueryResult {
    const incoming = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
    const key = this.db.uniqueKey(this.table);
    if (key && incoming.some((r) => rows.some((existing) => existing[key] === r[key]))) {
      return { data: null, error: { code: '23505', message: 'duplicate key value' } };
    }
    const inserted = incoming.map((r) => ({ ...r }));
    rows.push(...inserted);
    return this.shape(this.returning ? inserted : null);
  }

  private applyUpsert(rows: Row[]): QueryResult {
    const incoming = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
    const key = this.db.uniqueKey(this.table);
    for (const r of incoming) {
      const existing = key ? rows.find((row) => row[key] === r[key]) : undefined;
      if (existing) Object.assign(existing, r);
      else rows.push({ ...r });
    }
    return this.shape(this.returning ? incoming : null);
  }

  private shape(data: Row[] | null): QueryResult {
    if (data === null) return { data: null, error: null };
    const copies = data.map((row) => ({ ...row }));
    if (this.mode === 'many') return { data: copies, error: null };
    if (copies.length === 1) return { data: copies[0], error: null };
    if (copies.length === 0 && this.mode === 'maybeSingle') return { data: null, error: null };
    return {
      data: null,
      error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
    };
  }
}

export class FakeSupabase {
  private readonly tables = new Map<string, Row[]>();
  private readonly failingWrites = new Set<string>();

  constructor(
    seed: Record<string, Row[]> = {},
    private readonly options: FakeSupabaseOptions = {},
  ) {
    for (const [table, rows] of Object.entries(seed)) {
      this.tables.set(
        table,
        rows.map((row) => ({ ...row })),
      );
    }
  }

  from = (table: string): FakeQuery => new FakeQuery(this, table);

  rows(table: string): Row[] {
    if (!this.tables.has(table)) this.tables.set(table, []);
    return this.tables.get(table) as Row[];
  }

  setRows(table: string, rows: Row[]): void {
    this.tables.set(table, rows);
  }

  uniqueKey(table: string): string | undefined {
    return this.options.uniqueKeys?.[table];
  }

  /** Makes every insert/update/upsert/delete on `table` return a Postgres error. */
  failWrites(table: string): void {
    this.failingWrites.add(table);
  }

  isFailingWrites(table: string): boolean {
    return this.failingWrites.has(table);
  }
}
