// Password validation for registration
document.addEventListener('DOMContentLoaded', function() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirmPassword');
  const form = document.querySelector('form[action="/auth/register"]');
  
  if (form && passwordField && confirmPasswordField) {
    // When the form is submitted
    form.addEventListener('submit', function(event) {
      // Check if passwords match
      if (passwordField.value !== confirmPasswordField.value) {
        event.preventDefault();
        alert('Passwords do not match!');
        return false;
      }
      
      // Check password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordField.value)) {
        event.preventDefault();
        alert('Password must be at least 8 characters and include uppercase, lowercase, number and special character.');
        return false;
      }
      
      return true;
    });
    
    // Live validation as user types
    confirmPasswordField.addEventListener('input', function() {
      if (passwordField.value !== confirmPasswordField.value) {
        confirmPasswordField.setCustomValidity('Passwords do not match');
      } else {
        confirmPasswordField.setCustomValidity('');
      }
    });
    
    passwordField.addEventListener('input', function() {
      const value = passwordField.value;
      
      // Check against the password regex
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      
      if (!passwordRegex.test(value)) {
        passwordField.setCustomValidity('Password must be at least 8 characters and include uppercase, lowercase, number and special character');
      } else {
        passwordField.setCustomValidity('');
      }
      
      // Also check if it matches confirm password
      if (confirmPasswordField.value && value !== confirmPasswordField.value) {
        confirmPasswordField.setCustomValidity('Passwords do not match');
      } else if (confirmPasswordField.value) {
        confirmPasswordField.setCustomValidity('');
      }
    });
  }
});
