interface Env {
    TELLER_SIGNING_SECRET: string;
    TELLER_SIGNING_KEY: string;
    WEBHOOK_URL: string;
}
declare const _default: {
    fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map