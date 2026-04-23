function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      ok: false,
      message: 'Debes iniciar sesión'
    });
  }

  next();
}

module.exports = {
  requireAuth
};