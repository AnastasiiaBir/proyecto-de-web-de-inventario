exports.isEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

exports.isRequired = (value) => {
  return value && value.trim() !== '';
};
