import type { Request, Response, NextFunction } from "express";
import Task, { TaskType } from "../models/Task";

declare global {
  namespace Express {
    interface Request {
      task: TaskType;
    }
  }
}

export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ error: error.message });
    }
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
}

export function taskBelonsgToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(400).json({ error: error.message });
  }
  next();
}

export function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error("Accion no valida");
    return res.status(400).json({ error: error.message });
  }
  next();
}
