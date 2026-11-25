import { supabase, showMessage } from './supabase.js';

const form = document.querySelector('#loginForm');
const msg = document.querySelector('#message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return showMessage(msg, error.message, true);
  }

  location.href = 'dashboard.html';
});
