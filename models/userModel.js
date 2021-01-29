const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a user must have a name'],
        trim: true
        // maxlength: [40, 'a user name must have a 40 characters'],
        // minlength: [10, 'a user name must have a 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    email: {
        type: String,
        required: [true, 'a user must have a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    password: {
        type: String,
        required: [true, 'a user must have a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'a user must have a password'],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'password are not the same!!'
        }
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    passwordChangedAt: {
        type: Date
    },
    passwordReset: String,
    passwordResetExpired: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) {
        return next();
    }

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
})

userSchema.methods.validatePassword = async function(clientPassword, userPassword) {
    return await bcrypt.compare(clientPassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return jwtTimestamp < changedTimestamp;
    }

    return false;
}

userSchema.methods.createPasswordReset = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordReset = crypto.createHash('sha256').update(resetToken).digest('hex');
    // console.log({resetToken}, this.passwordReset);
    this.passwordResetExpired = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
