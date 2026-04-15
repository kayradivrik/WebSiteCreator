const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Untitled Page' },
  slug: { type: String, unique: true, sparse: true },
  canvasState: { type: Object, required: true }, // The JSON tree of components
  settings: {
    favicon: String,
    customCSS: String,
    googleFont: String,
    metaTitle: String,
    metaDescription: String,
    theme: {
      primary: String,
      secondary: String,
      accent: String,
      surface: String,
      text: String,
    },
  }
}, { timestamps: true });

module.exports = mongoose.model('Page', PageSchema);
