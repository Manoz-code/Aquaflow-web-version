const logActivity = require("../utils/activityLogger");

const adminMiddleware = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    await logActivity({
      userId: req.user.userId,
      action: "ACCESS_DENIED",
      resource: req.originalUrl,
      resourceId: null,
      description: `User attempted an admin-only action: ${req.method} ${req.originalUrl}`,
      ipAddress: req.ip,
    });

    return res.status(403).json({
      success: false,
      message: "Admin permission required",
    });
  }

  next();
};

module.exports = adminMiddleware;