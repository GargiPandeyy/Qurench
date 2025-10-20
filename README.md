[![Athena Award Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Faward.athena.hackclub.com%2Fapi%2Fbadge)](https://award.athena.hackclub.com?utm_source=readme)

🍁 Learn Canadian Eh! is a tiny web app that teaches Canadian English slang and Québécois French using simple flashcards and quick multiple‑choice quizzes. It runs entirely in the browser.

The app presents short, curated cards with a term, a plain‑English meaning, an example sentence, and a small fun fact. You can switch between Canadian English and Québécois French and explore categories like slang, food, weather, everyday phrases, and culture. From the same dataset, the app generates a quiz that asks what each term means and tracks your score while offering brief explanations. There is also a tiny beaver “companion” that reacts to your answers and celebrates streaks to keep things playful.

I built this because I enjoy the quirks of Canadian language and wanted a lightweight way to share them. This project was also a chance to practice small UX touches—like micro‑animations and streak messages—that make a simple tool feel more alive.

It’s made with plain HTML, CSS, and JavaScript. The content lives in local JSON files under data/english and data/french, split into the categories above. Flashcards are rendered with a small flip animation and basic navigation. Quizzes are created on the fly by combining the correct meaning with believable distractors sampled from the dataset, then scoring and showing an explanation line. The beaver companion is a minimal UI element that updates its message and expression based on correctness and streaks.

Along the way, I learned that sticking to static JSON keeps things simple, and that believable distractors make a big difference in how good a quiz feels. I also found that small, intentional animations and feedback loops are worth the effort because they add personality. Keeping the stack framework‑free made the project easy to maintain.

To try it locally, clone or download the repository and open index.html in a modern browser.

If I continue this, I’d like to add favorites and custom decks so you can build a personal set to study, a timed “Blizzard Blitz” mode for quick challenges, some lightweight badges like toques or scarves for milestones, and maybe province‑themed powers or a small map overlay to give regional flavor.

Built by Gargi Pandey and inspired by Canadian culture and everyday Québec French. Have fun—nice day out, eh? 🇨🇦

