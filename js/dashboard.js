import { supabase, requireUser, showMessage } from './supabase.js';
import { setLang, getLang, catLabel } from './language.js';
import { motivate } from './motivation.js';
import { loadTasks, addTask, renderTasks, loadProgress } from './tasks.js';

const user = await requireUser();
if (!user) throw new Error('Not signed in');

const welcome = document.querySelector('#welcome');
const taskList = document.querySelector('#taskList');
const msg = document.querySelector('#taskMessage');

const { data: profile } = await supabase
  .from('profiles')
  .select('full_name, category, preferred_language')
  .eq('id', user.id)
  .maybeSingle();

setLang(profile?.preferred_language || getLang());
welcome.textContent = `${getLang() === 'bn' ? 'স্বাগতম' : 'Welcome'}, ${profile?.full_name || ''}`;
document.querySelector('#userGroup').textContent = catLabel(profile?.category);

const lang = document.querySelector('#languageSelect');
lang.value = getLang();

lang.addEventListener('change', async () => {
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
