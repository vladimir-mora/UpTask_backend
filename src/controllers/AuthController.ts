import type { Request, Response } from "express";
import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";
import { check } from "express-validator";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const error = new Error("El usuario con ese correo ya existe");
        return res.status(409).json({ error: error.message });
      }
      const user = new User(req.body);
      user.password = await hashPassword(password);

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      AuthEmail.sendEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Cuenta creada exitosamente");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }
      const user = await User.findById(tokenExists.user);
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Cuenta confirmada exitosamente");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }
      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        AuthEmail.sendEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "Usuario no confirmado, revisa tu correo electrónico"
        );
        return res.status(401).json({ error: error.message });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        const error = new Error("Contraseña no válida");
        return res.status(401).json({ error: error.message });
      }

      const token = generateJWT({ id: user.id });
      res.send(token);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (user.confirmed === true) {
        const error = new Error("Usuario ya confirmado");
        return res.status(403).json({ error: error.message });
      }

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      AuthEmail.sendEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Código enviado exitosamente");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      AuthEmail.sendResetPasswordEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      res.send("Restablecimiento de contraseña enviado exitosamente");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }
      res.send("Token válido, puedes restablecer tu contraseña");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static updatePassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(req.body.password);
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Contraseña actualizada exitosamente");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error("Correo electrónico ya en uso");
      return res.status(409).json({ error: error.message });
    }

    req.user.name = name;
    req.user.email = email;
    try {
      await req.user.save();
      res.send("Perfil actualizado exitosamente");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static updatePasswordProfile = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;
    const user = await User.findById(req.user.id);
    const isPasswordValid = await comparePassword(
      current_password,
      user.password
    );
    if (!isPasswordValid) {
      const error = new Error("Contraseña actual no válida");
      return res.status(401).json({ error: error.message });
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("Contraseña actualizada exitosamente");
    } catch (error) {
      res.status(500).send(error);
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Contraseña no válida");
      return res.status(401).json({ error: error.message });
    }

    res.send("Contraseña válida");
  };
}
