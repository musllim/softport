const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const router = express.Router();

const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Notification = require("../models/Notification");
const Module = require("../models/Module");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()} -- ${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get("/", forwardAuthenticated, (req, res) =>
  res.render("home", { user: req.user })
);

// Dashboard
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const portfolio = await (
    await Portfolio.where("").populate("owner")
  ).filter(
    (work) =>
      work?.owner?.email === req?.user?.email ||
      req?.user?.permission === "admin"
  );

  const notifications = await (
    await Notification.find().populate("sender")
  ).filter((not) => not?.to?.toString() === req?.user?.id);

  const users = await User.find({});
  if (
    !req.user.permission?.toLowerCase()?.split(" ").includes("admin") &&
    !req.user.permission?.toLowerCase()?.split(" ").includes("lecturer")
  ) {
    const moduleNames = await (
      await Module.find()
    ).map((mod) => mod.moduleName);
    return res.render("index", {
      user: req.user,
      portfolio,
      moduleNames,
      notifications,
    });
  }
  if (req.user.permission.toLowerCase().split(" ").includes("lecturer")) {
    const moduleTeaches = await (await Module.find().populate("lecturer"))
      .filter((module) => module.lecturer?.id?.toString() === req.user.id)
      .map((module) => module.moduleCode);
    const portfolio = await (
      await Portfolio.find()
    ).filter((portf) => moduleTeaches?.includes(portf.moduleCode));
    return res.render("admin", {
      user: req.user,
      portfolio,
      notifications,
      users,
    });
  }
  const portfolios = await Portfolio.find();
  res.render("admin", {
    user: req.user,
    portfolio: portfolios,
    notifications,
    users,
  });
});

router.get("/logout", ensureAuthenticated, async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/dashboard/:userId", ensureAuthenticated, async (req, res) => {
  if (!req.user.permission == "admin" || !req.user.permission == "lecturer")
    return res.redirect("/dashboard");
  const selectedUser = await User.findById(req.params.userId);
  const portfolio = await (
    await Portfolio.where("").populate("owner")
  ).filter(
    (work) =>
      (work?.owner?.email === req.user.email ||
        req.user.permission === "admin") &&
      work?.owner.id === req.params.userId
  );
  const notifications = await (
    await Notification.find().populate("sender")
  ).filter((not) => not.to.toString() === req.user.id);

  const users = await User.find({});

  res.render("admin", {
    user: req.user,
    portfolio,
    notifications,
    selectedUser,
    users,
  });
});

router.put("/dashboard/:userId", ensureAuthenticated, async (req, res) => {
  if (!req.user.permission == "admin" || !req.user.permission == "lecturer")
    return res.redirect("/dashboard");
  const selectedUser = await User.findById(req.params.userId);
  const {
    name,
    email,
    regNo,
    departmentOPtion,
    permission,
    year,
    classesToTeach,
  } = req.body;
  name && (selectedUser.name = name);
  email && (selectedUser.email = email);
  regNo && (selectedUser.regNo = regNo);
  departmentOPtion && (selectedUser.departmentOPtion = departmentOPtion);
  permission && (selectedUser.permission += ` ${permission}`);
  classesToTeach &&
    (selectedUser.classesToTeach = [
      ...selectedUser.classesToTeach,
      classesToTeach,
    ]);
  year && (selectedUser.year = year);
  await selectedUser.save();

  const notification = new Notification({
    message: "Admin updated your profile",
    sender: req.user.id,
    to: req.params.userId,
  });

  await notification.save();

  const portfolio = await (
    await Portfolio.where("").populate("owner")
  ).filter(
    (work) =>
      work.owner.email === req.user.email || req.user.permission === "admin"
  );
  const notifications = await (
    await Notification.find().populate("sender")
  ).filter((not) => not.to.toString() === req.user.id);

  const users = await User.find({});
  res.render("admin", {
    user: req.user,
    portfolio,
    notifications,
    users,
    selectedUser,
  });
});

router.post("/dashboard/addModule", ensureAuthenticated, async (req, res) => {
  if (!req.user.permission == "admin") return res.redirect("/dashboard");
  const { moduleName, moduleCode, learningUnits, credits, year, lecturer } =
    req.body;
  const module = new Module({
    moduleName,
    moduleCode,
    learningUnits,
    credits,
    year,
    lecturer,
  });

  await module.save();
  return res.redirect("/dashboard");
});
router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", {
    user: req.user,
  });
});
router.post(
  "/profile",
  ensureAuthenticated,
  upload.single("avatar"),
  async (req, res) => {
    const { regNo, departmentOPtion, year } = req.body;
    const user = await User.findById(req.user.id);
    if (regNo) user.regNo = regNo;
    if (departmentOPtion) user.departmentOPtion = departmentOPtion;
    if (year) user.year = year;
    if (req?.file?.filename) user.avatar = req.file.filename;

    await user.save();
    res.redirect("/profile");
  }
);

module.exports = router;
