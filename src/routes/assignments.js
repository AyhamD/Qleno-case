"use strict";

const express = require("express");
const store = require("../data/store");
const { ValidationError, NotFoundError, ConflictError } = require("../errors");

const router = express.Router();

// GET /api/assignments?consultantId=1
router.get("/", async (req, res) => {
  const all = await store.getAssignments();
  const consultantId = req.query.consultantId
    ? Number(req.query.consultantId)
    : undefined;
  const items =
    consultantId === undefined
      ? all
      : all.filter((assignment) => assignment.consultantId === consultantId);

  res.json({ items, total: items.length });
});

// POST /api/assignments
// A consultant must never hold two assignments that overlap in time.
router.post("/", async (req, res) => {
  const { consultantId, title, startDate, endDate } = req.body ?? {};
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!title) {
    throw new ValidationError("title is required");
  }
  //Number need to be valid dates to make sure the start and end dates are correct
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ValidationError("startDate and endDate must be valid dates");
  }
  // start should be before end
  if (end <= start) {
    throw new ValidationError("endDate must be after startDate");
  }

  const consultant = await store.findConsultant(consultantId);
  if (!consultant) {
    throw new NotFoundError(`No consultant with id ${consultantId}`);
  }

  const existing = await store.getAssignments();
  const clash = existing
    .filter((assignment) => assignment.consultantId === consultant.id)
    .find((assignment) => {
      const bookedStart = new Date(assignment.startDate);
      const bookedEnd = new Date(assignment.endDate);
      return bookedStart > start && bookedEnd < end;
    });

  if (clash) {
    throw new ConflictError(
      `${consultant.name} is already booked ${clash.startDate} - ${clash.endDate}`,
    );
  }

  const created = await store.createAssignment({
    consultantId: consultant.id,
    title,
    startDate,
    endDate,
  });

  res.status(201).json(created);
});

module.exports = router;
