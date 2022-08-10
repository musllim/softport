const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const router = express.Router();

const Portfolio = require("../models/Portfolio");
const Module = require("../models/Module");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { ensureAuthenticated } = require("../config/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/portfolio");
  },
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()} -- ${file.originalname}`);
  },
});

const upload = multer({ storage });
router.post("/search", async (req, res) => {
  const portfolio = await Portfolio.find({ moduleCode: req.body.module }).sort(
    (prev, next) => prev.moduleCode > next.moduleCode
  );
  res.render("index", { user: req.user, portfolio });
});
router.put("/:id", async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const { decision } = req.body;
  portfolio.decision = decision;

  const newNotification = new Notification({
    sender: req.user.id,
    to: portfolio.owner._id,
    message: "commented on your work.",
  });
  await newNotification.save();
  await portfolio.save();
  await user.save();
  res.redirect("/dashboard");
});
router.delete("/:id", async (req, res) => {
  if (!req.user.permission.toLowerCase().split(" ").includes("admin"))
    return res.redirect("/dashboard");
  // const portfolio = await Portfolio.findById(req.params.id);
  const portfolio = await Portfolio.findOneAndDelete(req.params.id);
  const user = await User.findById(req.user.id);
  console.log(portfolio);
  const newNotification = new Notification({
    sender: req.user.id,
    to: portfolio.owner._id,
    message: "deleted your work.",
  });
  await newNotification.save();
  res.redirect("/dashboard");
});
router.post(
  "/add",
  ensureAuthenticated,
  upload.single("doc"),
  async (req, res) => {
    const { moduleCode, learningUnit, category } = req.body;
    let errors = [];

    if (!moduleCode || !learningUnit || !category) {
      errors.push({ msg: "Please enter all fields" });
    }

    if (errors.length > 0) {
      console.log(errors);
      res.render("index", {
        errors,
        moduleCode,
        learningUnit,
        category,
      });
    } else {
      Module.findOne({ moduleCode: moduleCode }).then(async (module) => {
        // return console.log(module);
        if (
          (module && module.learningUnits < learningUnit) ||
          moduleCode?.toLowerCase() != module?.moduleCode?.toLowerCase()
        ) {
          errors.push({ msg: "This learning unit does not exisit" });
          console.log(errors);

          res.render("index", {
            errors,
            moduleName: module.moduleName,
            moduleCode: module.moduleCode,
            learningUnit: module.learningUnits,
            category,
          });
        } else {
          const newPortfolio = new Portfolio({
            moduleName: module.moduleName,
            moduleCode,
            learningUnit,
            category,
            doc: req.file.filename,
            owner: req.user.id,
            credits: module.credits,
          });
          await newPortfolio.save();
          res.redirect("/dashboard");
        }
      });
    }
  }
);

module.exports = router;
