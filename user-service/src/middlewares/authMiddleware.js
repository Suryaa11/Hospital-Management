const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token locally using the same secret OR call auth-service.
            // Since they share the secret via env vars, we can verify it locally to save an HTTP roundtrip.
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_auth');

            req.user = decoded; // { id, role, userId, isFirstLogin }

            // If a doctor is logging in for the first time, force them to reset password, unless they are hitting the reset route.
            if (req.user.role === 'Doctor' && req.user.isFirstLogin) {
                 // allow passing if they are just querying their own profile or changing password
                 // This logic can be enforced on frontend, but it's good to be aware here.
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
