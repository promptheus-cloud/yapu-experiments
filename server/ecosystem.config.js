module.exports = {
  apps: [
    {
      name: "yapu-prod",
      script: "node_modules/.bin/next",
      args: "start -p 3003",
      cwd: "/home/yapu/yapu2",
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3003"
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M"
    },
    {
      name: "yapu-dev",
      script: "node_modules/.bin/next",
      args: "dev -p 3008",
      cwd: "/home/yapu/yapu2",
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        PORT: "3008"
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M"
    }
  ]
};
