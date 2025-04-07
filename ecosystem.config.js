module.exports = {
  apps: [{
    name: "whatsapp-bot",
    script: "npx",
    args: "ts-node src/index.ts",
    watch: ["src"],
    ignore_watch: ["node_modules", "auth_info_baileys"],
    env: {
      NODE_ENV: "production",
    },
    max_memory_restart: "1G",
    exp_backoff_restart_delay: 100,
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 3000,
    restart_delay: 4000
  }]
} 