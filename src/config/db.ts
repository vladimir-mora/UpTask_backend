import moongose from "mongoose";
import colors from "colors";
import { exit } from "node:process";

export const connectDB = async () => {
  try {
    const { connection } = await moongose.connect(process.env.DATABASE_URL);
    const url = `${connection.host}:${connection.port}`;
    console.log(colors.magenta.bold(`MongoDB Connected: ${url}`));
  } catch (error) {
    console.log(
      colors.bgRed.bold("Error al conectar a  MongoDB:" + error.message)
    );
    exit(1);
  }
};
