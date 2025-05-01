import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { upload, imprtarArquivo } from "../controllers/importarArquivo.js";
import { chat } from "../controllers/chat.js";
import { listarArquivosImportdos } from "../controllers/listarArquivosImportdos.js";
import { deletarArquivosImportados } from "../controllers/deletarArquivosImportados.js";
import { deletarArquivosProcessados } from "../controllers/deletarArquivosProcessados.js";
import { listarArquivosProcessados } from "../controllers/listarArquivosProcessados.js";
import { listarLog } from "../controllers/listarLog.js";
import { deletarLog } from "../controllers/deletarLog.js";
import { processFiles } from "../controllers/processarArquivos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastas base
const baseDataPath = path.resolve(__dirname, "../../../data");
// const uploadDir = path.join(baseDataPath, "uploads");
// const processedDir = path.join(baseDataPath, "processed");
// const logDir = path.join(baseDataPath, "log");

export function rotaChat(app) {
  // Upload de arquivo
  app.post("/api/upload", upload.single("file"), imprtarArquivo);

  // Listar listarArquivosImportdos
  app.get("/api/upload", (req, res) => {
    return listarArquivosImportdos(req, res);
  });

  // Deletar arquivo enviado
  app.delete("/api/upload/:fileName", (req, res) => {
    return deletarArquivosImportados(req, res);
  });

  // Listar arquivos processados
  app.get("/api/processed", (req, res) => {
    return listarArquivosProcessados(req, res);
  });

  // processar arquivos
  app.post("/api/processarArquivos", (req, res) => {
    return processFiles(req, res);
  });

  app.delete("/api/processarArquivos/:fileName", (req, res) => {
    deletarArquivosProcessados(req, res);
  });

  // Listar arquivos de log
  app.get("/api/logs", (req, res) => {
    return listarLog(req, res);
  });

  // rota para as convesas chat

  app.post("/api/chat", async (req, res) => {
    return await chat(req, res);
  });

  // Rota para deletar logs
  // Rota para deletar logs
  app.delete("/api/del", (req, res) => {
    deletarLog(req, res); // Apenas chama deletarLog
  });

  app.delete("/api/upload/:fileName", (req, res) => {
    deletarArquivosImportados(req, res);
  });
}

