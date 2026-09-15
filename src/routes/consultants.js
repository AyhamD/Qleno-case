"use strict";

const express = require("express");
const store = require("../data/store");
const { ValidationError, NotFoundError } = require("../errors");

const router = express.Router();

const DEFAULT_PAGE_SIZE = 10;

// GET /api/consultants
// Filtering:  ?skill=node.js   ?available=true|false
// Sorting:    ?sort=rate
// Pagination: ?page=1&pageSize=10
router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? DEFAULT_PAGE_SIZE);

  //instead of calling req.query.skill, req.query.sort, and req.query.available multiple times, we extract them into variables
  const skill = req.query.skill
    ? String(req.query.skill).toLowerCase()
    : undefined;
  const sort = req.query.sort
    ? String(req.query.sort).toLowerCase()
    : undefined;
  const available =
    req.query.available !== undefined
      ? req.query.available === "true"
      : undefined;

  // req.log is the per-request logger (see src/logger.js). Add lines like
  // this wherever you need to see what the code is actually doing.
  req.log.debug("Listing consultants", { page, pageSize, filters: req.query });

  const all = await store.getConsultants();
  let result = all;

  if (skill !== undefined) {
    result = result.filter((consultant) =>
      consultant.skills.some((s) => s.toLowerCase() === skill),
    );
  }

  if (available !== undefined) {
    result = result.filter((consultant) => consultant.available === available);
  }

  if (sort === "rate") {
    result.sort((a, b) => a.hourlyRate - b.hourlyRate);
  }

  // Pagination count where offset is the starting index for the current page and pageSize is the number of items per page
  const offset = (page - 1) * pageSize;
  const items = result.slice(offset, offset + pageSize);

  res.json({
    items,
    page,
    pageSize,
    total: result.length,
  });
});

// GET /api/consultants/:id
router.get("/:id", async (req, res) => {
  //use variable instead if referencing req.params.id multiple times
  const id = req.params.id;

  //check if the id is provided
  if (!req.params.id) {
    throw new ValidationError("id is required");
  }
  
  const consultant = await store.findConsultant(id);

  if (!consultant) {
    throw new NotFoundError(`No consultant with id ${id}`);
  }

  res.json(consultant);
});

// POST /api/consultants
router.post("/", async (req, res) => {
  const { name, email, skills, hourlyRate, yearsOfExperience, available } =
    req.body ?? {};

  if (!name) {
    throw new ValidationError("name is required");
  }
  if (!email || !String(email).includes("@")) {
    throw new ValidationError("email must be a valid email address");
  }
  if (!Array.isArray(skills)) {
    throw new ValidationError("skills must be an array");
  }
  //check if hourlyRate is provided and is a number >= 0
  if (!hourlyRate && hourlyRate >= 0) {
    throw new ValidationError(
      "hourlyRate is required and must be a number >= 0",
    );
  }
  if (!yearsOfExperience && yearsOfExperience >= 0) {
    throw new ValidationError(
      "yearsOfExperience is required and must be a number >= 0",
    );
  }

  const created = await store.createConsultant({
    name,
    email,
    skills,
    hourlyRate,
    yearsOfExperience,
    available: available ?? true,
  });

  res.status(200).json(created);
});

// PATCH /api/consultants/:id
router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const existing = await store.findConsultant(id);

  if (!existing) {
    throw new NotFoundError(`No consultant with id ${id}`);
  }
  const updates = req.body ?? {};
  //here to need to make sure that the user change correct values fields only
  const allowedFields = ["name", "email", "skills", "hourlyRate", "yearsOfExperience", "available"];
  for (const key of Object.keys(updates)) {
    if (!allowedFields.includes(key)) {
      throw new ValidationError(`Invalid field: ${key}`);
    }
  }

  Object.assign(existing, updates);

  res.json(existing);
});

// DELETE /api/consultants/:id
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const removed = await store.deleteConsultant(id);

  if (!removed) {
    throw new NotFoundError(`No consultant with id ${id}`);
  }

  res.status(204).end();
});

module.exports = router;
