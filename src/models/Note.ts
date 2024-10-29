import mongoose, { Schema, Document, Types } from "mongoose";

export interface INote extends Document {
  content: string;
  createBy: Types.ObjectId;
  task: Types.ObjectId;
}

const noteSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    createBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: Types.ObjectId,
      ref: "Task",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model<INote>("Note", noteSchema);
export default Note;
