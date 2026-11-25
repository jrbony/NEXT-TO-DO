import { supabase, showMessage } from './supabase.js';

const form = document.querySelector('#resetForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const p = document.querySelector('#password').value;
  const c = document.querySelector('#confirmPassword').value;
  const msg = document.querySelector('#message');

  if (p !== c) {
    return showMessage(msg, 'Passwords do not match.', true);
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return showMessage(msg, 'This reset link is invalid or expired. Please request a new one.', true);
  }

  const { error } = await supabase.auth.updateUser({ password: p });

  if (error) {
    return showMessage(msg, error.message, true);
  }

  showMessage(msg, 'Password updated. You can now sign in.');
  setTimeout(() => {
    location.href = 'login.html';
  }, 1200);
});
