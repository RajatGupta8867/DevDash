const User = require('./../models/usersmodel');
const AppError = require('./../utils/appError');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

const filterObj=(obj,...allowedFields)=>{
const newObj={};
  Object.keys(obj).forEach(el=>{
  if(allowedFields.includes(el)) newObj[el]=obj[el]
})
return newObj
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  users = await User.find(req.query);
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users: users },
  });
});

exports.getAUser = catchAsync(async (req, res) => {
  curr_user = await User.findOne({ _id: req.params.id });

  if (!curr_user) {
    next(AppError('No user found with that ID.', 404));
  }
  res.status(200).json({
    status: 'success',
    data: curr_user,
  });
});

exports.createAUser = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.updateAUser = catchAsync(async (req, res) => {
  const curr_user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!curr_user) {
    next(AppError('No user found with that ID.', 404));
  }
  res.status(200).json({ status: 'success', data: curr_user });
});

exports.deleteAUser = catchAsync(async (req, res) => {
  const curr_user = await User.findByIdAndDelete(req.params.id);
  if (!curr_user) {
    next(AppError('No user found with that ID.', 404));
  }
  res.status(200).json({ status: 'success', data: 'Deleted a user.' });
});

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword route.'
      )
    );
  }
  if(req.body.email){
    return next(
      new AppError(
        'You cannot change your email.'
      )
    );
  }
  const filteredBody=filterObj(req.body,'name');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    data:{
      user:updatedUser
    }
  });
};

exports.deleteMe=async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false})
  res.status(200).json({
    status:"Success",
    message:"User deleated."
  })
}