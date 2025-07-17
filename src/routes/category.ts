import { Router } from "express";
import { categoryController } from "@/controllers/categoryController";
import {
  validateParams,
  objectIdParam,
  validateQuery,
  schemas,
} from "@/middleware/validation";

const router = Router();

// Academic structure routes
router.get("/campuses", categoryController.getAllCampuses);
router.get("/departments", categoryController.getAllDepartments);
router.get(
  "/campuses/:campusId/colleges",
  validateParams(objectIdParam("campusId")),
  categoryController.getCampusColleges,
);
router.get(
  "/colleges/:collegeId/departments",
  validateParams(objectIdParam("collegeId")),
  categoryController.getCollegeDepartments,
);
router.get(
  "/departments/:departmentId/users",
  validateParams(objectIdParam("departmentId")),
  validateQuery(schemas.pagination),
  categoryController.getDepartmentUsers,
);

// Statistics
router.get(
  "/campuses/:campusId/stats",
  validateParams(schemas.objectId),
  categoryController.getCampusStats,
);
router.get(
  "/colleges/:collegeId/stats",
  validateParams(schemas.objectId),
  categoryController.getCollegeStats,
);

// Complete structure
router.get("/structure", categoryController.getAcademicStructure);

export default router;
