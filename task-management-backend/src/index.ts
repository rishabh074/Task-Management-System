import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import { authMiddleware } from "./middleware/auth";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());


app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);


app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted" });
});

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
