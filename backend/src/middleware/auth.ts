import { Request, Response, NextFunction } from 'express';

/**
 * Wix passes an instance token in the Authorization header.
 * In production, verify it using the Wix App Secret (HMAC).
 * Here we decode the instance ID from the base64 token.
 *
 * Wix instance token format: base64(JSON({ instanceId, ... }))
 * Full JWT verification: use the Wix Developers SDK in production.
 */
export function verifyWixInstance(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Decode the base64 Wix instance token
    let instanceId = 'local-dev-instance';

try {
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded) as { instanceId?: string; instance_id?: string };
  instanceId = parsed.instanceId || parsed.instance_id || 'local-dev-instance';
} catch (_) {
  // Token is not JSON — could be a real Wix JWT, use raw token as ID for now
  instanceId = token.substring(0, 36) || 'local-dev-instance';
}

req.instanceId = instanceId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Failed to parse Wix instance token' });
  }
}