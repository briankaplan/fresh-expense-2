"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
exports.closeTestApp = closeTestApp;
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
async function createTestApp() {
    const moduleRef = await testing_1.Test.createTestingModule({
        imports: [app_module_1.AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    return app;
}
async function closeTestApp(app) {
    await app.close();
}
//# sourceMappingURL=setup.js.map