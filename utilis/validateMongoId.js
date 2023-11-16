const mongoose = require("mongoose");
const validateMongoDbId = (_id) => {
  const isValid = mongoose.Types.ObjectId.isValid(_id);
  if (!isValid) throw new Error("This id is not valid or not Found");
};
module.exports = validateMongoDbId;