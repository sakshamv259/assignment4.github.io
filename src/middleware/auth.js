// Middleware to attach user to request if authenticated
const attachUser = (req, res, next) => {
    console.log('[Auth Middleware] Checking session:', {
        hasSession: !!req.session,
        hasUser: !!(req.session && req.session.user),
        sessionID: req.sessionID
    });
    
    // Make sure req.user exists - some routes may depend on this
    if (req.session && req.session.user) {
        req.user = req.session.user;
        console.log('[Auth Middleware] User attached to request:', req.user.username);
    }
    
    next();
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    console.log('[Auth Middleware] Checking authentication:', {
        hasSession: !!req.session,
        hasUser: !!(req.session && req.session.user),
        sessionID: req.sessionID,
        path: req.path
    });

    if (!req.session || !req.session.user) {
        console.log('[Auth Middleware] Not authenticated, sending 401');
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Ensure user is attached to request object
    req.user = req.session.user;
    console.log('[Auth Middleware] User authenticated:', req.user.username);
    next();
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        // Ensure user is attached to request object
        req.user = req.session.user;
        return next();
    }
    res.status(403).json({ success: false, message: 'Admin access required' });
};

module.exports = {
    attachUser,
    isAuthenticated,
    isAdmin
}; 