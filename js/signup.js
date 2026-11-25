import { supabase, showMessage } from './supabase.js';

const form = document.querySelector('#signupForm');
const msg = document.querySelector('#message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const full_name = document.querySelector('#fullName').value.trim();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const confirm = document.querySelector('#confirmPassword').value;
  const age = parseInt(document.querySelector('#age').value, 10);
  const category = document.querySelector('#category').value;
  const language = document.querySelector('#language').value;

  if (password !== confirm) {
    return showMessage(msg, 'Passwords do not match.', true);
  }

  if (password.length < 8) {
    return showMessage(msg, 'Use at least 8 characters.', true);
  }

  if (!Number.isInteger(age) || age < 5 || age > 100) {
    return showMessage(msg, 'Please enter a valid age (5–100).', true);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: new URL('login.html', location.href).href,
      data: {
        full_name,
        age,
        category,
        preferred_language: language,
      },
    },
  });

  if (error) {
    return showMessage(msg, error.message, true);
  }

  if (data.user && data.session) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name,
      age,
      category,
      preferred_language: language,
    });

    if (profileError) {
      return showMessage(
        msg,
        'Account created, but profile setup needs attention: ' + profileError.message,
        true
      );
    }
  }

  showMessage(msg, 'Registration request received. Check your email to verify your account, then sign in.');
});
