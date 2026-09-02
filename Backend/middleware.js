// Shared owner-only check. Protects any route that only the shop owner
// should be able to call (viewing all orders, messages, design requests,
// and uploading gallery photos).
//
// The frontend sends the password as a header: "x-admin-key".

function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_UPLOAD_KEY) {
    return res.status(401).json({ error: 'Not authorized. Owner access only.' });
  }
  next();
}

module.exports = { requireAdminKey };
