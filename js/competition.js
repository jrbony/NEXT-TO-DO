import { supabase, requireUser } from './supabase.js';
import { tr } from './language.js';

const user = await requireUser();
if (!user) throw new Error('No user');

const root = document.querySelector('#leaderboard');
const { data, error } = await supabase.rpc('group_leaderboard');

root.innerHTML = '';

if (error) {
  root.textContent = error.message;
} else if (!data?.length) {
  root.textContent = tr('No progress in your group yet. Add and complete tasks to appear here.');
} else {
  data.forEach((u, i) => {
    const row = document.createElement('p');
    row.textContent = `${i + 1}. ${u.display_name}${u.is_me ? ' (' + tr('You') + ')' : ''} — ${u.completion_rate}%`;

    if (u.is_me) {
      row.style.fontWeight = '700';
    }

    root.append(row);
  });
}
