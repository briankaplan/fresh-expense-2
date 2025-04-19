"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jose_1 = require("jose");
async function auth(request, env) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response('Unauthorized', { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await (0, jose_1.jwtVerify)(token, secret, {
            issuer: env.JWT_ISSUER,
            audience: env.JWT_AUDIENCE,
        });
        if (!payload.sub || !payload.email || !payload.role) {
            return new Response('Invalid token payload', { status: 401 });
        }
        request.user = {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        return undefined;
    }
    catch (error) {
        console.error('Auth error:', error);
        return new Response('Unauthorized', { status: 401 });
    }
}
//# sourceMappingURL=auth.js.map