Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = void 0;
const cors = (request) => {
  const origin = request.headers.get("Origin") || "*";
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
  if (request.method != null) {
    return new Response(null, { headers });
  }
  return headers;
};
exports.cors = cors;
//# sourceMappingURL=cors.js.map
