import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database";
import { userRouter } from "./user.routes";
import { authRouter } from "./auth.routes";
import { aipredictionRouter } from "./aiController";
import investigationRouter from "./investigation.routes";
import predictionRouter from "./prediction.routes";

// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();

const { ATLAS_URI } = process.env;

if (!ATLAS_URI) {
  console.error(
    "No ATLAS_URI environment variable has been defined in config.env"
  );
  process.exit(1);
}

connectToDatabase(ATLAS_URI)
  .then(() => {
    const app = express();
    app.use(cors());
    app.use("/", userRouter);
    app.use("/", authRouter);
    //app.use("/", productRouter);
    //app.use("/", orderRouter);
    app.use("/", aipredictionRouter);
    app.use("/", investigationRouter);
    app.use("/", predictionRouter);
    app.use(express.json());
    // start the Express server
    app.listen(5200, () => {
      console.log(`Server running at http://localhost:5200...`);
    });
  })
  .catch((error) => console.error(error));