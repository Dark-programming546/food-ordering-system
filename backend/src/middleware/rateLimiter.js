// Rate Limiter Middleware
// Prevents OTP spam (max 3 requests per hour per email)

const rateLimit = new Map(); // Store { email: { count, firstRequestTime } }

const rateLimiter = (maxRequests = 3, timeWindowMinutes = 60) => {
  return (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }
    
    const now = Date.now();
    const userRate = rateLimit.get(email);
    const timeWindowMs = timeWindowMinutes * 60 * 1000;
    
    if (userRate) {
      // Check if time window has passed
      if (now - userRate.firstRequestTime > timeWindowMs) {
        // Reset if window expired
        rateLimit.set(email, {
          count: 1,
          firstRequestTime: now
        });
        return next();
      }
      
      // Check if exceeded limit
      if (userRate.count >= maxRequests) {
        const minutesLeft = Math.ceil((timeWindowMs - (now - userRate.firstRequestTime)) / 60000);
        return res.status(429).json({
          success: false,
          message: `Too many OTP requests. Please try again in ${minutesLeft} minutes.`,
          remainingTime: minutesLeft
        });
      }
      
      // Increment count
      userRate.count++;
      rateLimit.set(email, userRate);
    } else {
      // First request
      rateLimit.set(email, {
        count: 1,
        firstRequestTime: now
      });
    }
    
    next();
  };
};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;
  for (const [email, data] of rateLimit.entries()) {
    if (now - data.firstRequestTime > oneHourMs) {
      rateLimit.delete(email);
    }
  }
}, 60 * 60 * 1000);

module.exports = rateLimiter;