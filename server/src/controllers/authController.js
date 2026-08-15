const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        password_hash,
        role,
        status,
        profile_image
      FROM users
      WHERE phone = $1
      AND status = 'active'
      `,
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingAdmin = await pool.query(
      `
      SELECT id
      FROM users
      WHERE role = 'admin'
      `
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(403).json({
        success: false,
        message: "An admin account already exists",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE phone = $1
      `,
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        phone,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, 'admin')
      RETURNING id, name, phone, role, status, created_at
      `,
      [name, phone, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Admin registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create admin account",
    });
  }
};


const registerStaff = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE phone = $1
      `,
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        phone,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, 'staff')
      RETURNING id, name, phone, role, status, created_at
      `,
      [name, phone, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Staff registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create staff account",
    });
  }
};


/* ============================= */
/* GET PROFILE */
/* ============================= */

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        role,
        status,
        profile_image,
        created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};


/* ============================= */
/* UPDATE PROFILE */
/* ============================= */

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET name = $1
      WHERE id = $2
      RETURNING
        id,
        name,
        phone,
        role,
        status,
        profile_image,
        created_at
      `,
      [name.trim(), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};


/* ============================= */
/* CHANGE PASSWORD */
/* ============================= */

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const result = await pool.query(
      `
      SELECT password_hash
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      12
    );

    await pool.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};


const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    // Get the user's current profile image
    const oldResult = await pool.query(
      `
      SELECT profile_image
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldImagePath = oldResult.rows[0].profile_image;

    // New image path stored in database
    const imagePath = `/uploads/profiles/${req.file.filename}`;

    // Update database with new image
    const result = await pool.query(
      `
      UPDATE users
      SET profile_image = $1
      WHERE id = $2
      RETURNING
        id,
        name,
        phone,
        role,
        status,
        profile_image,
        created_at
      `,
      [imagePath, userId]
    );

    // Delete the old physical image
    if (oldImagePath) {
      const oldFilename = path.basename(oldImagePath);

      const oldFilePath = path.join(
        __dirname,
        "../../uploads/profiles",
        oldFilename
      );

      fs.unlink(oldFilePath, (error) => {
        if (error && error.code !== "ENOENT") {
          console.error(
            "Failed to delete old profile image:",
            error.message
          );
        }
      });
    }

    res.json({
      success: true,
      message: "Profile image updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update profile image error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update profile image",
    });
  }
};


module.exports = {
  login,
  registerAdmin,
  registerStaff,
  getProfile,
  updateProfile,
  changePassword,
  updateProfileImage,
};