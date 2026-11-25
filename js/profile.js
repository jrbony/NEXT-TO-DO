import { supabase, requireUser, showMessage } from './supabase.js';
import { setLang } from './language.js';

const user = await requireUser();
if (!user) throw new Error('No user');

const $ = (s) => document.querySelector(s);
const form = $('#profileForm');
const msg = $('#message');

const { data: p } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle();

if (p) {
  $('#fullName').value = p.full_name || '';
  $('#age').value = p.age ?? '';
  $('#category').value = p.category || 'school_3_5';
  $('#language').value = p.preferred_language || 'en';
  $('#bio').value = p.bio || '';
  $('#showLb').checked = p.show_in_leaderboard !== false;

  if (p.avatar_url) {
    $('#avatarPreview').src = p.avatar_url;
    $('#avatarPreview').hidden = false;
  }

  setLang(p.preferred_language || 'en');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let avatar_url = p?.avatar_url || null;
  const file = $('#avatar').files[0];

  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      return showMessage(msg, 'Image must be 2 MB or smaller.', true);
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return showMessage(msg, 'Use JPG, PNG or WebP.', true);
    }

    const path = `${user.id}/avatar`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      return showMessage(msg, upErr.message, true);
    }

    avatar_url =
      supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl +
      '?v=' +
      Date.now();
  }

  const age = $('#age').value ? parseInt($('#age').value, 10) : null;
  if (age !== null && (!Number.isInteger(age) || age < 5 || age > 100)) {
    return showMessage(msg, 'Please enter a valid age (5–100).', true);
  }

  const payload = {
    id: user.id,
    age,
    full_name: $('#fullName').value.trim(),
    category: $('#category').value,
    preferred_language: $('#language').value,
    bio: $('#bio').value.trim(),
    show_in_leaderboard: $('#showLb').checked,
    avatar_url,
  };

  const { error } = await supabase.from('profiles').upsert(payload);
  if (error) {
    return showMessage(msg, error.message, true);
  }

  if (avatar_url) {
    $('#avatarPreview').src = avatar_url;
    $('#avatarPreview').hidden = false;
  }

  showMessage(msg, 'Profile saved.');
});
