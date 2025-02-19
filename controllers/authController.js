const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/AdminModel');
const Patient = require('../models/PaientModel');
const Doctor = require('../models/DoctorModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail=require("../middelwares/email");
const crypto = require("crypto");

const generateAdminId = () => {
  return "2" + Math.floor(1000000 + Math.random() * 9000000).toString();
};
exports.registerAdmin = async (req, res) => {
  try {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
          return res.status(400).json({ error: "Admin with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new admin
      const newAdmin = new Admin({
          adminId: generateAdminId(),
          name,
          email,
          password: hashedPassword,
      });

      await newAdmin.save();

      res.status(201).json({ message: "Admin registered successfully", admin: newAdmin });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Generate JWT Token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    });
};

// Create & Send Token in Cookies
const createSendToken = (user, statusCode, res ) => {
    
    
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIES_EXPIRY_DATE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined; // Hide password in response
    
    res.status(statusCode).json({
        token,
        user,
    });
};
const createSendTokenforDoctor = (doctor, statusCode, res ) => {
    
    
    const token = signToken(doctor.id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIES_EXPIRY_DATE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.cookie('jwt', token, cookieOptions);
    doctor.password = undefined; // Hide password in response
    
    res.status(statusCode).json({
        token,
        doctor,
    });
};

// 📌 Admin Login

exports.createDoctor = async (req, res, next) => {
  try {
    const { profilePicture, name, dob, gender, email, phoneNumber, speciality, password } = req.body;

    // Check for required fields
    if (!name || !dob || !gender || !email || !phoneNumber || !speciality || !password) {
      return next(new AppError("Missing required fields", 400));
    }

    // Determine doctorId prefix based on speciality
    let prefix = "9"; // Default if no matching speciality
    if (speciality.toLowerCase() === "embryologist") {
      prefix = "4";
    } else if (speciality.toLowerCase() === "fertilitydoctor") {
      prefix = "8";
    }

    // Generate a random 7-digit number
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000); // Ensures a 7-digit number
    const doctorId = `${prefix}${randomDigits}`;

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new doctor
    const newDoctor = await Doctor.create({
      profilePicture,
      doctorId,
      name,
      dob,
      gender,
      email,
      phoneNumber,
      speciality,
      password: hashedPassword,
    });

    // Success response
    res.status(201).json(new ApiResponse(201, newDoctor, "Doctor created successfully"));
  } catch (err) {
    return next(new AppError("Failed to create doctor", 500));
  }
};

// 📌 Patient Login
exports.patientLogin = catchAsync(async (req, res, next) => {
    const {  patientId, password } = req.body;

    // Validate request data
    if ( !patientId || !password) {
        return res.status(400).json({ error: "Please provide email, patient ID, and password" });
    }

    // Find patient by email and patientId, including password field
    const patient = await Patient.findOne({ patientId }).select("+password");

    if (!patient) {
        return next(new AppError("Invalid credentials", 401));
    }
    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, patient.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Invalid credentials" });
    }


    // Send token using your existing function
    createSendToken(patient, 200, res , req);
});

// 📌 Doctor Login
exports.doctorLogin = catchAsync(async (req, res, next) => {
    const {  doctorId, password } = req.body;
   

    // Validate request data
    if ( !doctorId || !password) {
        return res.status(400).json({ error: "Please provide email, patient ID, and password" });
    }

    // Find patient by email and patientId, including password field
    const doctor = await Doctor.findOne({ doctorId }).select("+password");
      console.log(doctor)
    if (!doctor) {
        return next(new AppError("Invalid credentials", 401));
    }
    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, doctor.password);
    console.log(isPasswordCorrect)
    if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Invalid credentials" });
    }


    // Send token using your existing function
    createSendTokenforDoctor(doctor, 200, res , req);
});

exports.adminLogin = async (req, res) => {
  try {
      const { adminId, password } = req.body;

      if (!adminId || !password) {
          return res.status(400).json({ error: "Please provide adminId and password" });
      }

      // Find admin by adminId
      const admin = await Admin.findOne({ adminId }).select("+password");

      if (!admin) {
          return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isPasswordCorrect = await bcrypt.compare(password, admin.password);
      if (!isPasswordCorrect) {
          return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT Token
      const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
          expiresIn: "7d",
      });

      res.status(200).json({
          message: "Login successful",
          token,
          admin: { adminId: admin.adminId, name: admin.name, email: admin.email   , role:admin.role}
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// 📌 Logout (Clear JWT Token)
exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(0),
        httpOnly: true,
    });

    res.status(200).json({ message: 'Logout successful' });
};


//Password for Admin   =================================================================================================
exports.forGetPassword = catchAsync(async (req, res, next) => {
    // Get the user based on given Email
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
        return next(new AppError("there is NO User with this Email ID ", 404));
    }
    
    // Create a rendom Token
    const resetToken = admin.createPasswordResetToken();
    
    await admin.save({ validateBeforeSave: false });
    
    // Send Email back to User
    // "protocol" works on all envirments
    // const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;
    const resetURL = `Hi ,Pleace follow this link to reset Your Password . This link is valid till 10 minutes from now . <a href=http://localhost:5173/reset-password/${resetToken}>Click Here</a>`
     
    
    try {
        await sendEmail({
            email: admin.email,
            subject: "Your Password Reset Token",
            message: "Forgot Your Password ? Submit The PATCH Request with your new Password & confrimPassword to : Below",
            html: resetURL
        })



        res.status(200).json("token send to your email address");


    } catch (error) {
        admin.passwordResetToken = undefined;
        admin.passwordResetExpires = undefined;
        await admin.save({ validateBeforeSave: false });

        return next(new AppError("there was no error sending the email , try Again later", 502))
    }

})

// ---- RESET PASSWORD  
exports.reSetPassword = catchAsync(async (req, res, next) => {
    // Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    
    const admin = await Admin.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    
    // If token has not expried , and there is user , set the new password
    if (!admin) {
        return next(new AppError("Token is invalid or is Expire", 404))
    }

    // Update changedpassword for the user

    admin.password = req.body.password;
    admin.confrimPassword = req.body.confrimPassword;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    res.status(200).json("password reset success");
    // Log the user in , send JWT
    // createSendToken(user , 200 , res);
})

// ----------  UPDATING PASSWORD   -------------------------------
exports.updatingPassword = catchAsync(async (req, res, next) => {

    // Get user from collection of data
    const admin = await Admin.findById(req.user._id).select("+password");
    // Check if the Posted current password is correct
    if (!(await admin.correctPassword(req.body.currentPassword, admin.password))) {
        return next(new AppError("Your current Password is Wrong ", 402));
    }
    // if So< Update The Password
    admin.password = req.body.password;
    admin.confrimPassword = req.body.confrimPassword;
    await admin.save();
    // Log user after password change
    createSendToken(admin, 203, res);
})




//Password for Doctor   ===============================================================================================

exports.forGetPasswordDoctor = catchAsync(async (req, res, next) => {

    // Get the user based on given Email
    const doctor = await Doctor.findOne({ email: req.body.email });
    if (!doctor) {
        return next(new AppError("there is NO User with this Email ID ", 404));
    }
    
    // Create a rendom Token
    const resetToken = doctor.createPasswordResetToken();
    await doctor.save({ validateBeforeSave: false });
    
    // Send Email back to User
    // "protocol" works on all envirments
    // const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;
    const resetURL = `Hi ,Pleace follow this link to reset Your Password . This link is valid till 10 minutes from now . <a href=http://localhost:5174/reset-password/${resetToken}>Click Here</a>`
    
   
    try {
        await sendEmail({
            email: doctor.email,
            subject: "Your Password Reset Token",
            message: "Forgot Your Password ? Submit The PATCH Request with your new Password & confrimPassword to : Below",
            html: resetURL
        })


        res.status(200).json("token send to your email address");


    } catch (error) {
        doctor.passwordResetToken = undefined;
        doctor.passwordResetExpires = undefined;
        await doctor.save({ validateBeforeSave: false });

        return next(new AppError("there was no error sending the email , try Again later", 502))
    }

})

// ---- RESET PASSWORD  
exports.reSetPasswordDoctor = catchAsync(async (req, res, next) => {

    // Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const doctor = await Doctor.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    // If token has not expried , and there is user , set the new password
    if (!doctor) {
        return next(new AppError("Token is invalid or is Expire", 404))
    }
    console.log(doctor);

    // Update changedpassword for the user

    doctor.password = req.body.password;
    doctor.confrimPassword = req.body.confrimPassword;
    doctor.passwordResetToken = undefined;
    doctor.passwordResetExpires = undefined;
    
    await doctor.save();

    res.status(200).json("password reset success");
    // Log the user in , send JWT
    // createSendToken(user , 200 , res);
})

// ----------  UPDATING PASSWORD   -------------------------------
exports.updatingPasswordDoctor = catchAsync(async (req, res, next) => {

    // Get user from collection of data
    const doctor = await Doctor.findById(req.user._id).select("+password");
    // Check if the Posted current password is correct
    if (!(await doctor.correctPassword(req.body.currentPassword, doctor.password))) {
        return next(new AppError("Your current Password is Wrong ", 402));
    }
    // if So< Update The Password
    doctor.password = req.body.password;
    doctor.confrimPassword = req.body.confrimPassword;
    await doctor.save();
    // Log user after password change
    createSendToken(doctor, 203, res);
})


// Password for Patient   ===========================================================================================

exports.forGetPasswordPatient = catchAsync(async (req, res, next) => {

    // Get the user based on given Email
    const patient = await Patient.findOne({ email: req.body.email });
    if (!patient) {
        return next(new AppError("there is NO User with this Email ID ", 404));
    }
    
    // Create a rendom Token
    const resetToken = patient.createPasswordResetToken();
    await patient.save({ validateBeforeSave: false });
    
    // Send Email back to User
    // "protocol" works on all envirments
    // const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;
    const resetURL = `Hi ,Pleace follow this link to reset Your Password . This link is valid till 5 minutes from now . <a href=http://localhost:5175/reset-password/${resetToken}>Click Here</a>`
    
   
    try {
        await sendEmail({
            email: patient.email,
            subject: "Your Password Reset Token",
            message: "Forgot Your Password ? Submit The PATCH Request with your new Password & confrimPassword to : Below",
            html: resetURL
        })


        res.status(200).json("token send to your email address");


    } catch (error) {
        patient.passwordResetToken = undefined;
        patient.passwordResetExpires = undefined;
        await patient.save({ validateBeforeSave: false });

        return next(new AppError("there was no error sending the email , try Again later", 502))
    }

})

// ---- RESET PASSWORD  
exports.reSetPasswordPatient = catchAsync(async (req, res, next) => {

    // Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const patient = await Patient.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    // If token has not expried , and there is user , set the new password
    if (!patient) {
        return next(new AppError("Token is invalid or is Expire", 404))
    }

    // Update changedpassword for the user

    patient.password = req.body.password;
    patient.confrimPassword = req.body.confrimPassword;
    patient.passwordResetToken = undefined;
    patient.passwordResetExpires = undefined;
    await patient.save();
  

    res.status(200).json("password reset success");
    // Log the user in , send JWT
    // createSendToken(user , 200 , res);
})

// ----------  UPDATING PASSWORD   -------------------------------
exports.updatingPasswordPatient = catchAsync(async (req, res, next) => {

    // Get user from collection of data
    const patient = await Patient.findById(req.user._id).select("+password");
    // Check if the Posted current password is correct
    if (!(await patient.correctPassword(req.body.currentPassword, patient.password))) {
        return next(new AppError("Your current Password is Wrong ", 402));
    }
    // if So< Update The Password
    patient.password = req.body.password;
    patient.confrimPassword = req.body.confrimPassword;
    await patient.save();
    // Log user after password change
    createSendToken(patient, 203, res);
})