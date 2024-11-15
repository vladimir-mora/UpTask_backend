import { transporter } from "../config/nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendEmail = async (user: IEmail) => {
    try {
      console.log("Intentando enviar correo de confirmación a:", user.email); // Log de inicio
      const info = await transporter.sendMail({
        from: "UpTask <vladimirescalante75@gmail.com>",
        to: user.email,
        subject: "UpTask - Confirm your account",
        text: "UpTask - confirm your account",
        html: `<p>Hola ${user.name}, has creado tu cuenta, solo falta confirmarla</p>
               <p>Visita el siguiente enlace para confirmar tu cuenta</p>
               <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
               <p>E ingresa el código: <b>${user.token}</b> </p>
               <p>Este token expira en 10 minutos</p>
             `,
      });
      console.log("Correo de confirmación enviado con éxito:", info.messageId);
    } catch (error) {
      console.error("Error al enviar correo de confirmación:", error);
    }
  };

  static sendResetPasswordEmail = async (user: IEmail) => {
    try {
      console.log(
        "Intentando enviar correo de restablecimiento a:",
        user.email
      ); // Log de inicio
      const info = await transporter.sendMail({
        from: "UpTask <vladimirescalante75@gmail.com>",
        to: user.email,
        subject: "UpTask - Reestablece tu password",
        text: "UpTask - Reestablece tu password",
        html: `<p>Hola ${user.name}, has solicitado reestablecer tu password</p>
               <p>Visita el siguiente enlace para reestablecer tu password</p>
               <a href="${process.env.FRONTEND_URL}/auth/reset-password">Reestablecer Password</a>
               <p>E ingresa el token: <b>${user.token}</b> </p>
               <p>Este token expira en 10 minutos</p>
             `,
      });
      console.log(
        "Correo de restablecimiento de contraseña enviado:",
        info.messageId
      );
    } catch (error) {
      console.error(
        "Error al enviar correo de restablecimiento de contraseña:",
        error
      );
    }
  };
}
