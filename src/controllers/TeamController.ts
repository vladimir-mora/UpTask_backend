import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email }).select("id name email");
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al buscar el miembro" });
    }
  };

  static getMembers = async (req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.project.id).populate({
        path: "team",
        select: "id name email",
      });
      res.json(project.team);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al obtener los miembros" });
    }
  };

  static addMember = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      const user = await User.findById(id).select("id");
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (
        req.project.team.some((team) => team.toString() === user.id.toString())
      ) {
        const error = new Error("Usuario ya está en el equipo");
        return res.status(409).json({ error: error.message });
      }

      req.project.team.push(user.id);
      await req.project.save();

      res.send("Miembro añadido exitosamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al añadir el miembro" });
    }
  };

  static removeMember = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (
        !req.project.team.some((team) => team.toString() === userId.toString())
      ) {
        const error = new Error("Usuario no está en el equipo");
        return res.status(409).json({ error: error.message });
      }

      req.project.team = req.project.team.filter(
        (team) => team.toString() !== userId.toString()
      );

      await req.project.save();
      res.send("Miembro eliminado exitosamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al eliminar el miembro" });
    }
  };
}
