"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("@/controllers/categoryController");
const validation_1 = require("@/middleware/validation");
const router = (0, express_1.Router)();
router.get('/campuses', categoryController_1.categoryController.getAllCampuses);
router.get('/campuses/:campusId/colleges', (0, validation_1.validateParams)(validation_1.schemas.objectId), categoryController_1.categoryController.getCampusColleges);
router.get('/colleges/:collegeId/departments', (0, validation_1.validateParams)(validation_1.schemas.objectId), categoryController_1.categoryController.getCollegeDepartments);
router.get('/departments/:departmentId/users', (0, validation_1.validateParams)(validation_1.schemas.objectId), (0, validation_1.validateQuery)(validation_1.schemas.pagination), categoryController_1.categoryController.getDepartmentUsers);
router.get('/campuses/:campusId/stats', (0, validation_1.validateParams)(validation_1.schemas.objectId), categoryController_1.categoryController.getCampusStats);
router.get('/colleges/:collegeId/stats', (0, validation_1.validateParams)(validation_1.schemas.objectId), categoryController_1.categoryController.getCollegeStats);
router.get('/structure', categoryController_1.categoryController.getAcademicStructure);
exports.default = router;
//# sourceMappingURL=category.js.map