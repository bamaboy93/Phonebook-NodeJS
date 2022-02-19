const { Schema, SchemaTypes, model } = require("mongoose");
const { ValidContactName } = require("../config/constant");
const mongoosePaginate = require("mongoose-paginate-v2");

const contactSchema = new Schema(
  {
    name: {
      type: String,
      min: ValidContactName.MIN_LENGTH,
      max: ValidContactName.MIN_LENGTH,
      required: [true, "Set name for contact"],
    },

    phone: {
      type: String,
      required: [true, "Set phone for contact"],
    },
    favorite: { type: Boolean, default: false },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);
contactSchema.plugin(mongoosePaginate);
const Contact = model("Contact", contactSchema);

module.exports = Contact;
