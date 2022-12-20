const User = require('./../models/usersmodel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { token } = require('morgan');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

const signToken = (id) => {
  const created_token = jwt.sign({ _id: id }, process.env.JWT_SECRET);
  return created_token;
};
const createSendToken = (user, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    // secure: true,
    httpOnly: true
  });
  return token
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    confirmPassword: req.body.confirmPassword,
  });

  const token = createSendToken(newUser,res);
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const pass = req.body.password;

  if (!email || !pass) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  const correct = await bcrypt.compare(pass, user.password);

  if (!user || !correct) {
    return next(new AppError('Incorrect eamil or password.', 401));
  }
  const token = createSendToken(user,res);

  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check if Token present
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('Your are not logged in, Please login to get access.', 401)
    );
  }
  // Verify Token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //Check if user still exists

  const currentUser = await User.findById(decoded._id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exists.')
    );
  }
  if (currentUser.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (changedTimeStamp > decoded.iat) {
      return next(
        new AppError('User recently changed password, Please login again.')
      );
    }
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permisson to perform this task.', 403)
      );
    }
    next();
  };
};

// exports.forgotPassword=catchAsync(async(req,res,next)=>{
//   const user=await User.findOne({email:req.body.email})
//   if(!user){
//     return next(new AppError('There is no user with this email address',404))
//   }
// // Token creation
//   const resetToken=crypto.randomBytes(32).toString('hex');
//   user.passwordResetToken=resetToken
//   user.passwordResetExpires=Date.now()+10*60*1000
//   console.log(resetToken)
//   await user.save({validateBeforeSave:false})
//   next();
// })
// exports.resetPassword=(req,res,next)=>{

//   next();
// }

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const correct = await bcrypt.compare(
    req.body.oldConfirmPassword,
    user.password
  );
  if (!correct) {
    return next(new AppError('Your current password is wronge.', 401));
  }
  user.password = req.body.password;
  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError('Mismatch in confirm password.', 400));
  }
  // user.confirmPassword=req.body.passwordConfirm
  await user.save();
  const token = createSendToken(user,res);
  res.json({
    status: 'Success',
    token: token,
  });
};

