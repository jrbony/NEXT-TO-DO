import { supabase, requireUser, showMessage } from './supabase.js';
import { tr } from './language.js';

const user = await requireUser();
if (!user) throw new Error('No user');

const form = document.querySelector('#routineForm');
const msg = document.querySelector('#message');
const list = document.querySelector('#publicRoutines');

async function refresh() {
  const { data, error } = await supabase
    .from('routines')
    .select('id, user_id, title, details, is_public')
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) {
    list.textContent = error.message;
    return;
  }

  list.innerHTML = '';

  for (const r of data || []) {
    const mine = r.user_id === user.id;

    const card = document.createElement('article');
    card.className = 'task-item';

    const text = document.createElement('div');
    const h = document.createElement('strong');
    h.textContent = r.title + (mine ? ' · ' + tr(r.is_public ? 'Public' : 'Private') : '');

    const p = document.createElement('p');
    p.textContent = r.details;
    text.append(h, p);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = tr(mine ? 'Delete' : 'Copy');

    btn.addEventListener('click', async () => {
      if (mine) {
        if (!confirm(tr('Delete this routine?'))) return;
        const { error } = await supabase.from('routines').delete().eq('id', r.id);
        if (error) {
          alert(error.message);
        } else {
          refresh();
        }
      } else {
        const { error } = await supabase.from('routines').insert({
          user_id: user.id,
          title: (r.title + ' (copy)').slice(0, 80),
          details: r.details,
          is_public: false,
        });
        alert(error ? error.message : tr('Routine copied to your private routines.'));
        refresh();
      }
    });

    card.append(text, btn);
    list.append(card);
  }

  if (!list.children.length) {
    list.textContent = tr('No routines yet.');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { error } = await supabase.from('routines').insert({
    user_id: user.id,
    title: document.querySelector('#title').value.trim(),
    details: document.querySelector('#details').value.trim(),
    is_public: document.querySelector('#isPublic').checked,
  });

  if (error) {
    return showMessage(msg, error.message, true);
  }

  showMessage(msg, 'Routine saved.');
  form.reset();
  refresh();
});

await refresh();
