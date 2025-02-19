const Embryo = require("../models/Embryo");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");

// 📌 Create a new Embryo Record
exports.createEmbryo = async (req, res, next) => {
  try {
    const { patientId, embryoId, fertilizationDate, status } = req.body;

    if (!patientId || !embryoId || !fertilizationDate || !status) {
      return next(new AppError("Missing required fields", 400));
    }

    const newEmbryo = await Embryo.create({ patientId, embryoId, fertilizationDate, status });

    res.status(201).json(new ApiResponse(201, newEmbryo, "Embryo record created successfully"));
  } catch (err) {
    return next(new AppError("Failed to create embryo record", 500));
  }
};

// 📌 Get All Embryo Records
exports.getAllEmbryos = async (req, res, next) => {
  try {
    const embryos = await Embryo.find().populate("patientId");

    res.status(200).json(new ApiResponse(200, embryos, "Embryo records retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch embryo records", 500));
  }
};

// 📌 Get Embryo by ID
exports.getEmbryoById = async (req, res, next) => {
  try {
    const embryo = await Embryo.findById(req.params.id).populate("patientId");

    if (!embryo) return next(new AppError("Embryo record not found", 404));

    res.status(200).json(new ApiResponse(200, embryo, "Embryo record retrieved successfully"));
  } catch (err) {
    return next(new AppError("Failed to fetch embryo record", 500));
  }
};

// 📌 Update Embryo Record
exports.updateEmbryo = async (req, res, next) => {
  try {
    const updatedEmbryo = await Embryo.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedEmbryo) return next(new AppError("Embryo record not found", 404));

    res.status(200).json(new ApiResponse(200, updatedEmbryo, "Embryo record updated successfully"));
  } catch (err) {
    return next(new AppError("Failed to update embryo record", 500));
  }
};

// 📌 Delete Embryo Record
exports.deleteEmbryo = async (req, res, next) => {
  try {
    const deletedEmbryo = await Embryo.findByIdAndDelete(req.params.id);

    if (!deletedEmbryo) return next(new AppError("Embryo record not found", 404));

    res.status(200).json(new ApiResponse(200, null, "Embryo record deleted successfully"));
  } catch (err) {
    return next(new AppError("Failed to delete embryo record", 500));
  }
};
