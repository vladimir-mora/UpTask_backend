import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    project.manager = req.user._id;
    try {
      await project.save();
      res.send("Proyecto creado exitosamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al crear el proyecto" });
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          { manager: { $in: req.user._id } },
          { team: { $in: req.user._id } },
        ],
      });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al obtener los proyectos" });
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({
          error: error.message,
        });
      }
      if (
        project.manager.toString() !== req.user._id.toString() &&
        !project.team.includes(req.user._id)
      ) {
        const error = new Error("Acción no válida");
        return res.status(400).json({
          error: error.message,
        });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al obtener el proyecto" });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName;
      req.project.clientName = req.body.clientName;
      req.project.description = req.body.description;
      await req.project.save();
      res.send("Proyecto actualizado exitosamente");
    } catch (error) {
      res
        .status(500)
        .json({ error: "Hubo un error al actualizar el proyecto" });
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send("Proyecto eliminado exitosamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al eliminar el proyecto" });
    }
  };
}
