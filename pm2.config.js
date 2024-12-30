module.exports = {
  apps: [{
    name: 'pm2-admin',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PORT: 13001,
      NODE_ENV: 'production'
    },
    // Build commands to run before starting the app
    deploy: {
      production: {
        'pre-deploy-local': 'npm run build'
      }
    }
  }]
}
