import adminAuth from "./adminAuth.js";
import authUser from "./authUser.js";

/**
 * For POST /api/chat/accesschat:
 * - If body.userId is provided (admin starting a chat with a user) -> use adminAuth, keep body.userId.
 * - If body.userId is not provided (user opening their own chat) -> use authUser, which sets body.userId from token.
 */
const authChatAccess = (req, res, next) => {
  if (req.body && req.body.userId) {
    return adminAuth(req, res, next);
  }
  return authUser(req, res, next);
};

export default authChatAccess;
