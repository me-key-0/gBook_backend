"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("@/controllers/searchController");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/middleware/validation");
const rateLimiter_1 = require("@/middleware/rateLimiter");
const router = (0, express_1.Router)();
router.get('/users', auth_1.optionalAuth, rateLimiter_1.searchLimiter, (0, validation_1.validateQuery)(validation_1.schemas.search), searchController_1.searchController.searchUsers);
router.get('/posts', rateLimiter_1.searchLimiter, searchController_1.searchController.searchPosts);
router.get('/quick', rateLimiter_1.searchLimiter, searchController_1.searchController.getQuickSearch);
router.get('/filters', searchController_1.searchController.getSearchFilters);
router.get('/popular', searchController_1.searchController.getPopularSearches);
router.use(auth_1.authenticate);
router.get('/suggested', searchController_1.searchController.getSuggestedUsers);
router.get('/recent', searchController_1.searchController.getRecentSearches);
router.post('/save', searchController_1.searchController.saveSearch);
exports.default = router;
//# sourceMappingURL=search.js.map