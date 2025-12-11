module.exports = {
    apps: [
        {
            name: "crystaltides-backend",
            script: "./index.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env: {
                NODE_ENV: "development",
                PORT: 3001
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3001 // O el puerto interno que prefieras en la VPS
            }
        }
    ]
};
