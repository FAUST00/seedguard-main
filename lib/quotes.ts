/** Motivational quotes shown on the dashboard's Daily Wisdom card. */
export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'The first and greatest victory is to conquer yourself.', author: 'Plato' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'He who conquers himself is the mightiest warrior.', author: 'Confucius' },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca' },
  { text: 'What we do in life echoes in eternity.', author: 'Marcus Aurelius' },
  { text: 'The successful warrior is the average man with laser-like focus.', author: 'Bruce Lee' },
  { text: 'We become what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'If it is not right, do not do it; if it is not true, do not say it.', author: 'Marcus Aurelius' },
  { text: 'Self-control is the chief element in self-respect, and self-respect is the chief element in courage.', author: 'Thucydides' },
  { text: 'The cave you fear to enter holds the treasure you seek.', author: 'Joseph Campbell' },
  { text: 'Real freedom is not freedom from responsibility: it is the freedom that comes from mastering yourself.', author: '' },
  { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'The more you sweat in training, the less you bleed in battle.', author: 'Sun Tzu' },
  { text: 'One day or day one. You decide.', author: '' },
  { text: 'Every battle is won before it is ever fought.', author: 'Sun Tzu' },
  { text: 'Between stimulus and response there is a space. In that space is our power to choose our response.', author: 'Viktor Frankl' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'Strength does not come from physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi' },
  { text: 'Your future self is watching you right now through your memories. Make him proud.', author: '' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'The secret of discipline is motivation. When a man is sufficiently motivated, discipline will take care of itself.', author: 'Sir Alexander Paterson' },
  { text: 'We must all suffer one of two things: the pain of discipline or the pain of regret.', author: 'Jim Rohn' },
  { text: 'Either you run the day, or the day runs you.', author: 'Jim Rohn' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese Proverb' },
  { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { text: 'Pain is temporary. Quitting lasts forever.', author: 'Lance Armstrong' },
  { text: 'Do not pray for an easy life. Pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
  { text: 'What you resist, persists. What you accept, you can change.', author: 'Carl Jung' },
  { text: 'Until you make the unconscious conscious, it will direct your life and you will call it fate.', author: 'Carl Jung' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.', author: 'Aristotle' },
  { text: 'The energy you put into controlling yourself is the same energy others waste on excuses.', author: '' },
  { text: 'Every day is a new opportunity to be better than yesterday.', author: '' },
  { text: 'The strongest man is not he who overcomes others, but he who overcomes himself.', author: '' },
  { text: 'A warrior does not give up what he loves. He finds the love in what he does.', author: 'Dan Millman' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'If you are going through hell, keep going.', author: 'Winston Churchill' },
  { text: 'Continuous effort, not strength or intelligence, is the key to unlocking our potential.', author: 'Winston Churchill' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Your life does not get better by chance. It gets better by change.', author: 'Jim Rohn' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'I am not a product of my circumstances. I am a product of my decisions.', author: 'Stephen Covey' },
  { text: 'By failing to prepare, you are preparing to fail.', author: 'Benjamin Franklin' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
];

/** Pick a random quote index, avoiding an immediate repeat. */
export function randomQuoteIndex(exclude: number): number {
  let next: number;
  do { next = Math.floor(Math.random() * QUOTES.length); }
  while (next === exclude && QUOTES.length > 1);
  return next;
}
