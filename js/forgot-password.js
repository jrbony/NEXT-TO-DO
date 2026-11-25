import { supabase, showMessage } from './supabase.js';

document.querySelector('#forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value.trim();
  const msg = document.querySelector('#message');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL('reset-password.html', location.href).href,
  });

  if (error) {
    return showMessage(msg, error.message, true);
  }

  showMessage(msg, 'If the account exists, a password reset email has been sent.');
});
