import { supabase, requireUser, showMessage } from './supabase.js';
import { setLang, getLang, catLabel } from './language.js';
import { motivate } from './motivation.js';
import { loadTasks, addTask, renderTasks, loadProgress } from './tasks.js';

const user = await requireUser();
if (!user) throw new Error('Not signed in');

const welcome = document.querySelector('#welcome');
const taskList = document.querySelector('#taskList');
const msg = document.querySelector('#taskMessage');

let { data: profile } = await supabase
  .from('profiles')
  .select('full_name, category, preferred_language')
  .eq('id', user.id)
  .maybeSingle();

// যদি profiles টেবিলে নাম না থাকে বা 'New user' থাকে, তবে সাইনআপের মেটাডাটা থেকে নাম নেবে
const metaName = user.user_metadata?.full_name?.trim();
const displayName =
  (profile?.full_name && profile.full_name !== 'New user' ? profile.full_name : metaName) ||
  user.email?.split('@')[0] ||
  'User';

// ডাটাবেজে প্রোফাইল না থাকলে অটোমেটিক তৈরি/আপডেট করে নেবে
if (!profile || (!profile.full_name && metaName)) {
  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: displayName,
    category: profile?.category || user.user_metadata?.category || 'school_3_5',
    preferred_language: profile?.preferred_language || user.user_metadata?.preferred_language || 'en',
  });
}

setLang(profile?.preferred_language || getLang());
welcome.textContent = `${getLang() === 'bn' ? 'স্বাগতম' : 'Welcome'}, ${displayName}`;
document.querySelector('#userGroup').textContent = catLabel(
  profile?.category || user.user_metadata?.category
);

const lang = document.querySelector('#languageSelect');
lang.value = getLang();

lang.addEventListener('change', async () => {
  setLang(lang.value);
  welcome.textContent = `${getLang() === 'bn' ? 'স্বাগতম' : 'Welcome'}, ${displayName}`;
  await supabase
    .from('profiles')
    .update({ preferred_language: lang.value })
    .eq('id', user.id);
});

const today = new Date();
today.setHours(0, 0, 0, 0);

const dateInput = document.querySelector('#taskDate');
const iso = (d) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 10);
};

dateInput.min = iso(today);
const max = new Date(today);
max.setDate(max.getDate() + 2);
dateInput.max = iso(max);
dateInput.value = iso(today);

async function refresh() {
  const tasks = await loadTasks(user.id, iso(today), iso(max));
  renderTasks(taskList, tasks, refresh);

  const todayTasks = tasks.filter((t) => t.task_date === iso(today));
  const done = todayTasks.filter((t) => t.is_completed).length;

  document.querySelector('#todayCount').textContent = `${done} / ${todayTasks.length}`;
  document.querySelector('#todayPercent').textContent = todayTasks.length
    ? `${Math.round((done / todayTasks.length) * 100)}%`
    : '—%';

  await loadProgress(user.id, document.querySelector('#progressList'));
}

await refresh();
motivate();

document.querySelector('#taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.querySelector('#taskTitle').value.trim();
  const date = dateInput.value;
  if (!title) return;

  const { error } = await addTask(user.id, title, date);
  if (error) return showMessage(msg, error.message, true);

  document.querySelector('#taskTitle').value = '';
  showMessage(msg, 'Task added.');
  await refresh();
});

document.querySelector('#logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.href = 'login.html';
});
