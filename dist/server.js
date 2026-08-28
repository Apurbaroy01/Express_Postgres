
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
            

// src/app.ts
import express from "express";

// src/modules/user/user.routes.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.DATABASE_URL || "",
  port: process.env.PORT || 5e3,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20) NOT NULL,
                email VARCHAR(20) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                age INT NOT NULL,
                role VARCHAR(10) DEFAULT 'user',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

            )
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                id SERIAL PRIMARY KEY,
                user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                bio TEXT,
                address TEXT,
                phone VARCHAR(15),
                gender VARCHAR(10),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()

            )
            `);
    console.log("Table created successfully\u2705");
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

// src/modules/user/user.services.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (paload) => {
  const { name, email, password, age, role } = paload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, age, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
    [name, email, hashedPassword, age, role]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUsers = async () => {
  const result = await pool.query(`
            SELECT * FROM users
            `);
  return result;
};
var getUserById = async (id) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result;
};
var updateUser = async (id, paload) => {
  const { name, email, password, age } = paload;
  const result = await pool.query(`
            UPDATE users
            SET name =COALESCE($1, name), email = $2, password = $3, age = $4
            WHERE id = $5
            RETURNING *
            `, [name, email, password, age, id]);
  return result;
};
var deleteUser = async (id) => {
  const result = await pool.query(`
            DELETE FROM users
            WHERE id = $1
            RETURNING *
            `, [id]);
  return result;
};
var UserService = {
  createUserIntoDB,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};

// src/utlity/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.contriller.ts
var createUser = async (req, res) => {
  try {
    const result = await UserService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating user:", error);
    sendResponse_default(res, {
      statusCode: 201,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUsers2 = async (req, res) => {
  try {
    const result = await UserService.getAllUsers();
    res.status(200).json({ success: true, message: "Users fetched successfully", users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
var getUserById2 = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await UserService.getUserById(id);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User fetched successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};
var updateUser2 = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, age } = req.body;
  try {
    const result = await UserService.updateUser(id, { name, email, password, age });
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};
var deleteUser2 = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await UserService.deleteUser(id);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
var userController = {
  createUser,
  getUserById: getUserById2,
  getAllUsers: getAllUsers2,
  updateUser: updateUser2,
  deleteUser: deleteUser2
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const decodedToken = jwt.verify(token, config_default.secret);
      if (!decodedToken) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const userData = await pool.query(
        `
            SELECT * FROM users
            WHERE email = $1
            `,
        [decodedToken.email]
      );
      if (userData.rows.length === 0) {
        return res.status(401).json({ success: false, message: "user not found" });
      }
      const user = userData.rows[0];
      console.log("user:", user);
      if (!user?.is_active) {
        return res.status(401).json({ success: false, message: "user is not active" });
      }
      if (roles.length && !roles.includes(user.role)) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  ADMIN: "admin",
  USER: "user"
};

// src/modules/user/user.routes.ts
var router = Router();
router.post("/user/api", userController.createUser);
router.get("/user/api", auth_default(USER_ROLE.ADMIN), userController.getAllUsers);
router.get("/user/api/:id", userController.getUserById);
router.put("/user/api/:id", userController.updateUser);
router.delete("/user/api/:id", userController.deleteUser);
var userRoutes = router;

// src/modules/userProfiles/profile.route.ts
import { Router as Router2 } from "express";

// src/modules/userProfiles/profile.services.ts
var createProfileIntoDB = async (paload) => {
  const { user_id, bio, address, phone, gender } = paload;
  const user = await pool.query(
    `
        SELECT * FROM users
        WHERE id = $1`,
    [user_id]
  );
  if (!user.rows.length) {
    throw new Error("User not found");
  }
  const result = await pool.query(
    `
            INSERT INTO profiles (user_id, bio, address, phone, gender)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
    [user_id, bio, address, phone, gender]
  );
  return result;
};
var profileService = {
  createProfileIntoDB
};

// src/modules/userProfiles/profile.controller.ts
var createProfile = async (req, res) => {
  try {
    const result = await profileService.createProfileIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Profile created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var profileController = {
  createProfile
};

// src/modules/userProfiles/profile.route.ts
var router2 = Router2();
router2.post("/api/profiles", profileController.createProfile);
var ProfilesRoutes = router2;

// src/modules/auth/auth.routes.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.services.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users
        WHERE email = $1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid password");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  const reFreshToken = jwt2.sign(jwtPayload, config_default.refresh_secret, { expiresIn: "10d" });
  return { accessToken, reFreshToken };
};
var genarateRefreshToken = async (token) => {
  console.log("RE_token:", token);
  if (!token) {
    throw new Error("Invalid token");
  }
  const decodedToken = jwt2.verify(token, config_default.refresh_secret);
  if (!decodedToken) {
    throw new Error("Invalid token");
  }
  const userData = await pool.query(
    `
            SELECT * FROM users
            WHERE email = $1
            `,
    [decodedToken.email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = userData.rows[0];
  console.log("user:", user);
  if (!user?.is_active) {
    throw new Error("User is not active");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  return { accessToken };
};
var authServices = {
  loginUserIntoDB,
  genarateRefreshToken
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authServices.loginUserIntoDB(req.body);
    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { reFreshToken } = result;
    res.cookie("refreshToken", reFreshToken, { httpOnly: true, sameSite: "none", secure: true });
    res.status(200).json({ message: "User logged in successfully", data: result });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authServices.genarateRefreshToken(req.cookies.refreshToken);
    res.status(200).json({ message: "Access token generated successfully", data: result });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};
var authController = {
  loginUser,
  refreshToken
};

// src/modules/auth/auth.routes.ts
var route = Router3();
route.post("/api/auth/login", authController.loginUser);
route.post("/api/refresh-token", authController.refreshToken);
var authRoutes = route;

// src/middleware/logger.ts
import fs from "fs";
var logger = ((req, res, next) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const log = [`[${timestamp}]`, `METHOD: ${req.method}`, `URL: ${req.originalUrl}`, `IP: ${req.ip}`, `USER-AGENT: ${req.get("user-agent") || "Unknown"}`].join(" | ");
  fs.appendFile("./log.txt", log + "\n", "utf8", (err) => {
    if (err) console.error(err);
  });
  next();
});
var logger_default = logger;

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandeler.ts
var globalErrorHandler = ((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
var globalErrorHandeler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "*"
}));
app.use(logger_default);
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/", userRoutes);
app.use("/", ProfilesRoutes);
app.use("/", authRoutes);
app.use(globalErrorHandeler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB().catch(console.error);
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map