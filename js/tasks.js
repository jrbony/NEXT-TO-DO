import { supabase } from './supabase.js';
import { motivate } from './motivation.js';
import { tr } from './language.js';

export async function loadTasks(userId, start, end) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('task_date', start)
    .lte('task_date', end)
    .order('task_date')
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function addTask(userId, title, date) {
  return await supabase.from('tasks').insert({
    user_id: userId,
    title,
    task_date: date,
  });
}

export function renderTasks(container, tasks, refresh) {
  container.innerHTML = '';

  if (!tasks.length) {
    container.textContent = tr('No tasks yet. Add your first task above.');
    return;
  }

  for (const task of tasks) {
    const row = document.createElement('div');
    row.className = 'task-item' + (task.is_completed ? ' done' : '');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = task.is_completed;
    check.setAttribute('aria-label', 'Mark task complete');

    const name = document.createElement('span');
    name.className = 'task-name';
    name.textContent = `${task.task_date} · ${task.title}`;

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Delete';

    del.addEventListener('click', async () => {
      if (!confirm('Delete this task?')) return;
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) {
        alert(error.message);
      } else {
        refresh();
      }
    });

    check.addEventListener('change', async () => {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: check.checked,
          completed_at: check.checked ? new Date().toISOString() : null,
        })
        .eq('id', task.id);

      if (error) {
        alert(error.message);
        return;
      }

      if (check.checked) motivate();
      refresh();
    });

    row.append(check, name, del);
    container.append(row);
  }
}

export async function loadProgress(userId, container) {
  const start = new Date();
  start.setDate(start.getDate() - 14);
  const end = new Date();

  const fmt = (d) => {
    const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return x.toISOString().slice(0, 10);
  };

  const { data, error } = await supabase
    .from('tasks')
    .select('task_date, is_completed')
    .eq('user_id', userId)
    .gte('task_date', fmt(start))
    .lte('task_date', fmt(end));

  if (error) {
    container.textContent = error.message;
    return;
  }

  container.innerHTML = '';

  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = fmt(d);
    const list = (data || []).filter((t) => t.task_date === key);

    if (!list.length) continue;

    const pct = Math.round(
      (list.filter((t) => t.is_completed).length / list.length) * 100
    );

    const row = document.createElement('div');
    row.className = 'progress-row';

    const date = document.createElement('span');
    date.textContent = key.slice(5);

    const bar = document.createElement('div');
    bar.className = 'progress';

    const fill = document.createElement('span');
    fill.style.width = pct + '%';
    bar.append(fill);

    const value = document.createElement('strong');
    value.textContent = pct + '%';

    row.append(date, bar, value);
    container.append(row);
  }
}
