const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide username.'],
    default: 'Default Username',
    unique: [true, 'Username already present.'],
  },
  slug: String,
  name: {
    type: String,
    required: [true, 'Please provide your Name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: [true, 'Email already present.'],
    validate: [validator.isEmail, 'Incorrect Email.'],
  },
  password: {
    type: String,
    required: [true, 'Password should not be empty.'],
    minlength: [06, 'A password must be 6 or more characters long.'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'chota-admin','recruiter', 'user'],
    default: 'user',
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your Password.'],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: 'Password are not the same.',
    },
  },
  age: { type: Number, default: 00 },
  gender: { type: String, default: 'Male', enum: ['Male', 'Female'] },
  website: { type: String, default: 'Not provided' },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  date_joined: { type: Date, default: Date.now() },
  place: { type: String, Default: 'Not_Available' },
  skills: { type: String, Default: 'Not_Provided' },
  passwordChangedAt:Date,
  passwordResetToken:String,
  passwordResetExpires:Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }
});

userSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

userSchema.pre(/^find/, function (next) {
 this.find({active:{$ne:false}})
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter=function(JWTTimeStamp){
  if(this.passwordChangedAt){
    const changedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
    return (changedTimeStamp>JWTTimeStamp)
  }
  return false
}
const User = mongoose.model('User', userSchema);

module.exports = User;
