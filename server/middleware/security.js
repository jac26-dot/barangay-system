const rateLimit = require('express-rate-limit');

// Headers that stop browsers from caching, sniffing or framing API
// responses. Personal data must never sit in a shared browser cache.
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  res.setHeader('Cache-Control', 'no-store');
  next();
}

// Server errors (HTTP 5xx) can contain database details such as table
// names, constraint names or even the value that failed. Log them on the
// server and send the browser a generic message instead.
function hideServerErrors(req, res, next) {
  const json = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 500 && body && typeof body === 'object' && body.message) {
      console.error(`[${req.method} ${req.originalUrl.split('?')[0]}]`, body.message);
      body = { ...body, message: 'Something went wrong. Please try again.' };
    }
    return json(body);
  };
  next();
}

// The admin login had no limit at all, so a password could be guessed
// without end. Only failed attempts count toward the limit.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many failed login attempts. Please try again in 15 minutes.' },
});

module.exports = { securityHeaders, hideServerErrors, adminLoginLimiter };
