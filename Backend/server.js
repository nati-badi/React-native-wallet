// const express = require("express");
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World! 123");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on Port:${PORT}`);
});
