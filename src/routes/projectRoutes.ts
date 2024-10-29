import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import {
  hasAuthorization,
  taskBelonsgToProject,
  taskExists,
} from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio")
    .isString()
    .withMessage("El nombre del proyecto debe ser una cadena de texto"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio")
    .isString()
    .withMessage("El nombre del cliente debe ser una cadena de texto"),
  body("description")
    .notEmpty()
    .withMessage("La descripción es obligatoria")
    .isString()
    .withMessage("La descripción debe ser una cadena de texto"),
  handleInputErrors,
  ProjectController.createProject
);

router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID inválido"),
  handleInputErrors,
  ProjectController.getProjectById
);

router.param("projectId", projectExists);

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID inválido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio")
    .isString()
    .withMessage("El nombre del proyecto debe ser una cadena de texto"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio")
    .isString()
    .withMessage("El nombre del cliente debe ser una cadena de texto"),
  body("description")
    .notEmpty()
    .withMessage("La descripción es obligatoria")
    .isString()
    .withMessage("La descripción debe ser una cadena de texto"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID inválido"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);

// Rutas para tareas

router.post(
  "/:projectId/tasks",
  hasAuthorization,
  body("name")
    .isString()
    .withMessage("El nombre debe ser una cadena de texto")
    .notEmpty()
    .withMessage("El nombre es obligatorio"),
  body("description")
    .isString()
    .withMessage("La descripción debe ser una cadena de texto")
    .notEmpty()
    .withMessage("La descripción es obligatoria"),
  handleInputErrors,
  TaskController.createTask
);

router.get(
  "/:projectId/tasks",
  handleInputErrors,
  TaskController.getProjectTasks
);

router.param("taskId", taskExists);
router.param("taskId", taskBelonsgToProject);

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("ID inválido"),
  handleInputErrors,
  TaskController.getTaskById
);

router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("ID inválido"),
  body("name")
    .isString()
    .withMessage("El nombre debe ser una cadena de texto")
    .notEmpty()
    .withMessage("El nombre es obligatorio"),
  body("description")
    .isString()
    .withMessage("La descripción debe ser una cadena de texto")
    .notEmpty()
    .withMessage("La descripción es obligatoria"),
  handleInputErrors,
  TaskController.updateTask
);

router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("ID inválido"),
  handleInputErrors,
  TaskController.deleteTask
);

router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("ID inválido"),
  body("status").notEmpty().withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
);

// Rutas para el equipo

router.post(
  "/:projectId/team/find",
  body("email")
    .isEmail()
    .toLowerCase()
    .withMessage("Correo electrónico inválido"),
  handleInputErrors,
  TeamController.findMemberByEmail
);

router.get("/:projectId/team", TeamController.getMembers);

router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("ID inválido"),
  handleInputErrors,
  TeamController.addMember
);

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("ID inválido"),
  handleInputErrors,
  TeamController.removeMember
);

// Rutas para notas

router.post(
  "/:projectId/task/:taskId/notes",
  body("content").notEmpty().withMessage("El contenido es obligatorio"),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:projectId/task/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectId/task/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("ID inválido"),
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
