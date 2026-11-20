module.exports = (req, res, next) => {
  const project = req.body.project;
  if (project === undefined) return next();

  let parsedProject = project;
  if (typeof project === "string") {
    if (!project.trim()) {
      req.body.project = {};
      return next();
    }

    try {
      parsedProject = JSON.parse(project);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Project must contain valid JSON.",
      });
    }
  }

  if (!parsedProject || typeof parsedProject !== "object" || Array.isArray(parsedProject)) {
    return res.status(400).json({
      success: false,
      message: "Project must be a JSON object.",
    });
  }

  req.body.project = parsedProject;
  return next();
};
