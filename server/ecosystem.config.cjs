module.exports = {
  apps: [
    {
      name: 'pretinho-backend',
      script: 'src/index.js',
      cwd: __dirname,
      watch: false,
      env: {
        PORT: process.env.PORT || 3333,
        NODE_ENV: process.env.NODE_ENV || 'production'
      }
    }
  ]
};
