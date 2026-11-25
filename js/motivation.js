import { getLang } from './language.js';

const M = {
  en: [
    'Tomorrow is a great chance to do even better! 🌟',
    'You are moving forward step by step 💪',
    'Your consistency is your strength 🚀',
    "Today's effort builds tomorrow's success 🌱",
    'Small steps make big dreams come true ✨',
    'Plan well tonight, shine tomorrow 🌙',
  ],
  bn: [
    'আগামীকাল আরও ভালো করার দারুণ সুযোগ! 🌟',
    'আপনি ধাপে ধাপে এগিয়ে যাচ্ছেন 💪',
    'ধারাবাহিকতাই আপনার শক্তি 🚀',
    'আজকের চেষ্টা কালকের সাফল্য গড়ে 🌱',
    'ছোট ছোট পদক্ষেপেই বড় স্বপ্ন পূরণ হয় ✨',
    'আজ রাতে ভালো পরিকল্পনা করুন, কাল ঝলমল করুন 🌙',
  ],
};

export function motivate() {
  const a = M[getLang()] || M.en;
  let el = document.getElementById('toast');

  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }

  el.textContent = a[Math.floor(Math.random() * a.length)];
  el.classList.add('show');

  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove('show');
  }, 4500);
}
