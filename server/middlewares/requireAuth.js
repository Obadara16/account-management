const jwt = require("jsonwebtoken");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const requireAuthAndAuthorization = async (req, res, next) => {
  try {
    await requireAuth(req, res, async () => {
      const userId = req.user.userId;
      const { id } = req.params;

      if (userId === id || req.user.role === "admin") {
        next();
      } else {
        res.status(403).json({ error: "Unauthorized access" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const requireAuthAndAdmin = async (req, res, next) => {
  try {
    await requireAuth(req, res, async () => {
      if (req.user.role === "admin") {
        next();
      } else {
        res.status(403).json({ error: "Admin access required" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  requireAuth,
  requireAuthAndAuthorization,
  requireAuthAndAdmin,
};
