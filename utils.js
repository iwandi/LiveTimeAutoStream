function isValidString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }
  
  // Export for use in other files
  module.exports = {
    isValidString,
  };