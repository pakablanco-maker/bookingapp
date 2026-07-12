/**
 * Authentication Middleware with Sentry Logging
 * 
 * Tracks authentication attempts and failures for security monitoring.
 * Distinguishes between different error types for better insights.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { captureWarning, captureException, addBreadcrumb } from '../config/sentry.js';

const authenticate = (req, res, next) => {
  try {
    // Extract token from headers or cookies
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.slice(7)
        : req.headers.authorization;
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // No token provided
    if (!token) {
      captureWarning('Authentication attempt without token', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      addBreadcrumb({
        category: 'auth.attempt',
        message: 'Missing token',
        level: 'warning',
        data: { path: req.path },
      });
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store decoded token info on request for use in controllers
    req.user = decoded;
    req.userId = decoded.id;

    // Log successful authentication
    addBreadcrumb({
      category: 'auth.success',
      message: 'Authentication successful',
      level: 'info',
      data: { userId: decoded.id },
    });

    next();
  } catch (error) {
    // Log authentication errors with context
    const errorContext = {
      ip: req.ip,
      path: req.path,
      method: req.method,
    };

    if (error.name === 'TokenExpiredError') {
      // Token expired - expected error, log as warning
      captureWarning('Token expired', {
        ...errorContext,
        expiredAt: error.expiredAt,
      });
      addBreadcrumb({
        category: 'auth.token_expired',
        message: 'JWT token expired',
        level: 'warning',
        data: errorContext,
      });
    } else if (error.name === 'JsonWebTokenError') {
      // Invalid token format - malformed or tampered
      captureWarning('Invalid token', {
        ...errorContext,
        reason: error.message,
      });
      addBreadcrumb({
        category: 'auth.invalid_token',
        message: 'JWT verification failed',
        level: 'warning',
        data: errorContext,
      });
    } else {
      // Unexpected error - log as exception
      captureException(error, {
        ...errorContext,
        module: 'authenticate',
      });
      addBreadcrumb({
        category: 'auth.error',
        message: 'Authentication error',
        level: 'error',
        data: errorContext,
      });
    }

    return res.status(401).json({
      message: 'Token is not valid',
      error: error.message,
    });
  }
};

export default authenticate;
