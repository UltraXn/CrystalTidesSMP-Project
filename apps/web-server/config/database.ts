// MySQL database connection is disabled as the service is no longer in use.
// This mock prevents the application from crashing when services attempt to query the defunct database.

const mockPool = {
    query: async <T = any>(_sql: string, _params?: any[]) => [[] as unknown as T, []],
    execute: async <T = any>(_sql: string, _params?: any[]) => [[] as unknown as T, []],
    end: async () => {},
    promise: () => mockPool,
    on: () => {},
    connect: () => {}
};

export default mockPool;
