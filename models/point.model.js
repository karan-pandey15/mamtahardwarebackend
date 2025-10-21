// const mongoose = require('mongoose');

// const pointRequestSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   productName: { type: String, required: true },
//   description: { type: String, required: true },
//   points: { type: Number, required: true },  // Points for this product/request
//   quantity: { type: Number, required: true, default: 1 },
//   status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
// }, { timestamps: true });

// module.exports = mongoose.model('PointRequest', pointRequestSchema);



const mongoose = require('mongoose');

const pointRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },  // Points per product
  quantity: { type: Number, required: true, default: 1 },
  totalPoints: { type: Number },  // New field
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

// 🧮 Automatically calculate totalPoints before saving
pointRequestSchema.pre('save', function(next) {
  this.totalPoints = this.points * this.quantity;
  next();
});

// 🧮 Also update totalPoints when document is updated
pointRequestSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.points !== undefined || update.quantity !== undefined) {
    const points = update.points !== undefined ? update.points : this._update.$set?.points;
    const quantity = update.quantity !== undefined ? update.quantity : this._update.$set?.quantity;
    if (points && quantity) {
      this.set({ totalPoints: points * quantity });
    }
  }
  next();
});

module.exports = mongoose.model('PointRequest', pointRequestSchema);
