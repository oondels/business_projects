const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.development" });
} else {
  dotenv.config({ path: ".env" });
}

const appsDir = path.resolve(__dirname, "src");
const appFiles = fs.readdirSync(appsDir).filter((file) => file.endsWith(".js"));

const appConfigs = appFiles.map((file) => {
  const appName = path.basename(file, ".js");
  return {
    name: appName,
    script: path.join(appsDir, file),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      IP: process.env.IP,
      PASS: process.env.PASS,
      USERS: process.env.USERS,
      PORT: process.env.PORT,
      DBASE: process.env.DBASE,
    },
  };
});

module.exports = {
  apps: appConfigs,
};
