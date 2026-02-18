// MySQL database connection is disabled as the service is no longer in use.
// This mock prevents the application from crashing when services attempt to query the defunct database.

const mockPool = {
    query: async <T = unknown>(_sql: string, _params?: unknown[]) => [[] as unknown as T, []],
    execute: async <T = unknown>(_sql: string, _params?: unknown[]) => [[] as unknown as T, []],
    end: async () => {},
    promise: () => mockPool,
    on: () => {},
    connect: () => {}
};

export default mockPool;
