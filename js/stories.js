import { supabase, requireUser, showMessage } from './supabase.js';
import { tr, getLang } from './language.js';

const user = await requireUser();
if (!user) throw new Error('No user');

const form = document.querySelector('#storyForm');
const msg = document.querySelector('#message');
const feed = document.querySelector('#feed');
const box = document.querySelector('#body');

async function refresh() {
  const { data, error } = await supabase.rpc('stories_feed');

  if (error) {
    feed.textContent = error.message;
    return;
  }

  feed.innerHTML = '';

  if (!data?.length) {
    feed.textContent = tr('No stories yet. Be the first to share!');
    return;
  }

  for (const s of data) {
    const card = document.createElement('article');
    card.className = 'panel';

    const h = document.createElement('strong');
    h.textContent = s.author + (s.mine ? ' (' + tr('You') + ')' : '');

    const d = document.createElement('small');
    d.className = 'muted';
    d.textContent =
      ' · ' + new Date(s.created_at).toLocaleString(getLang() === 'bn' ? 'bn-BD' : 'en-GB');

    const p = document.createElement('p');
    p.textContent = s.body;
    p.style.whiteSpace = 'pre-wrap';
    p.style.overflowWrap = 'anywhere';

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn small secondary';
    b.textContent = tr(s.mine ? 'Delete' : 'Report');

    b.addEventListener('click', async () => {
      if (s.mine) {
        if (!confirm(tr('Delete this story?'))) return;
        const { error } = await supabase.from('stories').delete().eq('id', s.id);
        if (error) {
          alert(error.message);
        } else {
          refresh();
        }
      } else {
        if (!confirm(tr('Report this story as inappropriate?'))) return;
        const { error } = await supabase
          .from('story_reports')
          .insert({ story_id: s.id, reporter_id: user.id });

        alert(
          error && error.code !== '23505'
            ? error.message
            : tr('Thank you. We will review it.')
        );
        refresh();
      }
    });

    card.append(h, d, p, b);
    feed.append(card);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = box.value.trim();
  if (!body) return;

  const { error } = await supabase
    .from('stories')
    .insert({ user_id: user.id, body });

  if (error) {
    return showMessage(msg, error.message, true);
  }

  box.value = '';
  showMessage(msg, 'Posted.');
  refresh();
});

await refresh();
