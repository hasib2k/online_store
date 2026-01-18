module.exports = {
  apps: [
    {
      name: 'online_store',
      script: 'npm',
      args: 'start',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      // Optional: run in cluster mode to utilize multiple CPU cores
      // exec_mode: 'cluster',
      // instances: 'max',
    },
  ],
};
