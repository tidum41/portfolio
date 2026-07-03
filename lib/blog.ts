export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  dateISO: string;
  excerpt: string;
  readingTimeMin: number;
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "what-i-learned-as-a-product-designer-at-apple",
    title: "What I learned as a product designer at Apple",
    date: "Dec 30, 2022",
    dateISO: "2022-12-30",
    excerpt:
      "Six things that fundamentally changed how I think about product decisions, collaboration, and the meaning of simplicity.",
    readingTimeMin: 6,
    content: `<h2>Details are the product</h2>
<p>The most surprising thing about working alongside Apple designers wasn't the secrecy or the scale — it was how seriously everyone took the smallest things. A 2px misalignment in a rarely-used settings screen was treated with the same urgency as a core interaction bug. Not because it directly affected most users, but because the discipline of caring about details everywhere builds the culture that creates great products everywhere.</p>
<h2>Simplicity is a result, not a starting point</h2>
<p>Every product I saw that felt effortlessly simple had gone through many complex iterations first. Simplicity doesn't come from avoiding complexity — it comes from understanding a problem so thoroughly that you can strip it down to what truly matters. You can't skip to simple. You have to earn it.</p>
<h2>Collaboration beats conviction</h2>
<p>The best ideas I saw rarely came from one person with a vision. They came from two people in a hallway, a comment in a design review, a question during a prototype walkthrough. Strong individual conviction matters, but it has to be paired with genuine openness. The designers who made the most impact were also the best listeners.</p>
<h2>Users don't read your intent</h2>
<p>It doesn't matter why you made a design decision — only what the user experiences. I saw brilliant rationales attached to designs that confused people. The explanation isn't part of the interface. If the intent doesn't show in the interaction, the intent doesn't exist.</p>
<h2>Ship to learn</h2>
<p>The gap between what you can predict in testing and what you learn from real usage is enormous. Shipping a thoughtful v1 quickly beats a perfect v2 that takes three times as long. The feedback loop of real usage is irreplaceable.</p>
<h2>Your taste is a muscle</h2>
<p>Working around people with refined taste made me realize how much taste is built through deliberate practice — consuming great design, questioning your reactions to it, articulating why something works or doesn't. Taste isn't innate. It's trained.</p>`,
  },
  {
    slug: "how-does-cultural-background-influence-product-design",
    title: "How does our cultural background influence product design?",
    date: "Mar 15, 2022",
    dateISO: "2022-03-15",
    excerpt:
      "The assumptions baked into our design decisions often trace back to where we grew up. Here's why that matters more than we think.",
    readingTimeMin: 5,
    content: `<h2>Design is never culturally neutral</h2>
<p>Every product decision encodes assumptions about how people live, communicate, and think. Left-to-right reading direction, individualistic account structures, time zones as the primary identifier of location — these feel universal from certain vantage points and deeply foreign from others.</p>
<h2>The invisible defaults</h2>
<p>Western-educated designers often default to patterns that feel natural in North American and European contexts: linear onboarding flows, text-heavy UI, individual identity systems, low-context communication. These defaults work well in some markets and create friction in others.</p>
<p>I grew up navigating between two cultural frameworks. That dual perspective made me more aware of when I was designing from assumption versus designing from research. The gaps are rarely obvious until someone who lives differently encounters your product.</p>
<h2>What this means in practice</h2>
<p>It means building research practices that go beyond convenience samples. It means hiring teams with genuinely diverse lived experience, not just diverse demographics. It means treating localization as a design problem, not a translation problem. And it means staying curious about your own defaults.</p>
<p>The most universal products I've used feel like they were designed by someone who started with genuine curiosity about how different people think — not certainty about how everyone thinks.</p>`,
  },
  {
    slug: "how-to-use-chatgpt-for-design-systems-documentation",
    title: "How to use ChatGPT when working on design systems documentation",
    date: "Feb 28, 2022",
    dateISO: "2022-02-28",
    excerpt:
      "AI won't design your system — but it can eliminate the parts of documentation that make you want to avoid writing it.",
    readingTimeMin: 4,
    content: `<h2>The documentation problem</h2>
<p>Design system documentation is notoriously hard to keep current. The people who know the system best are the people with the least time to write about it. As a result, documentation lags behind implementation, and teams end up making inconsistent decisions not from carelessness but from lack of visibility.</p>
<h2>Where AI actually helps</h2>
<p>I've found AI tools most useful for three specific documentation tasks:</p>
<ul>
<li><strong>First drafts from notes.</strong> I describe a component decision in voice-note-quality language and get back a structured first draft. The draft is never final, but going from nothing to something is the hardest step.</li>
<li><strong>Consistent tone editing.</strong> Design docs often feel inconsistent because multiple people wrote them over time. AI is good at applying a style guide to existing prose without losing the technical meaning.</li>
<li><strong>Usage example generation.</strong> Describing when to use a component and when not to is tedious but important. AI can generate plausible examples from a component's name and description, which you then edit to accuracy.</li>
</ul>
<h2>What it doesn't replace</h2>
<p>AI can't tell you why your team made the decision you made, what tradeoffs were considered, or what the failure mode of a component is in an edge case. That institutional knowledge lives in your team's heads. Your job is still to extract it — AI just makes the writing-it-down part less painful.</p>`,
  },
  {
    slug: "coding-wont-exist-in-5-years",
    title: "Coding won't exist in 5 years. This is why",
    date: "Feb 6, 2022",
    dateISO: "2022-02-06",
    excerpt:
      "A deliberately provocative title for a nuanced argument: what actually changes when AI can write most production code.",
    readingTimeMin: 5,
    content: `<h2>The actual claim</h2>
<p>Not that code disappears. That the act of manually typing code as the primary mode of software creation becomes a niche skill — the way typesetting is now a niche skill. The output (software) persists. The bottleneck shifts.</p>
<h2>What shifts when the bottleneck shifts</h2>
<p>When writing code stops being the constraint, system design and product judgment become the constraints. The question stops being "can we build this?" and becomes "should we build this, and what exactly is this?"</p>
<p>This is actually good news for designers. The skills that matter most in a world where code generation is cheap are the skills design has always required: understanding users deeply, making coherent decisions about what a product should and shouldn't do, communicating intent clearly enough that others (or machines) can execute it faithfully.</p>
<h2>What the next five years actually look like</h2>
<p>Not a clean transition. A messy period where some teams prototype in hours what used to take weeks, while other teams spend those hours arguing about prompts and reviewing AI-generated code for subtle errors. The productivity gains are real but uneven. The skills that transfer are judgment-heavy. The skills that depreciate fastest are implementation-heavy.</p>
<p>If you're a designer: learn enough to direct and review AI-generated code. If you're an engineer: get closer to users and product decisions. The middle ground, where software builders also think deeply about what they're building, is where the value concentrates.</p>`,
  },
  {
    slug: "fresh-sans-serif-fonts-for-2023",
    title: "Bored with Poppins & Inter, here are some new fresh sans-serif for 2023",
    date: "Jan 12, 2022",
    dateISO: "2022-01-12",
    excerpt:
      "The design community's font monoculture has gotten comfortable. Here are six typefaces worth actually trying.",
    readingTimeMin: 4,
    content: `<h2>The monoculture problem</h2>
<p>Open a new Figma file today and there's a reasonable chance it starts with Inter or Poppins. Both are excellent typefaces. Both are also everywhere, and everywhere-ness has a cost: your work signals nothing about your typographic taste because your typographic choices signal nothing at all.</p>
<h2>Six worth trying</h2>
<p><strong>Neue Haas Grotesk.</strong> The typeface Helvetica is based on, before the compromises that made Helvetica work for phototypesetting. Warmer at small sizes, sharper at large ones. More character without sacrificing utility.</p>
<p><strong>Sohne.</strong> Klim Type's contemporary take on the grotesque tradition. Exceptionally legible at small text sizes. The kind of typeface that makes body copy feel effortless to read without the reader knowing why.</p>
<p><strong>Space Grotesk.</strong> Has personality — slightly quirky letterforms that work better in display contexts than body. Good for projects where you want something distinctive that isn't decorative.</p>
<p><strong>Instrument Sans.</strong> Google Fonts, free, genuinely good. Clean geometric grotesque that doesn't feel corporate. Worth trying before defaulting to Inter again.</p>
<p><strong>DM Sans.</strong> Also free. Slightly more humanist than Inter. Works well in interfaces where you want warmth without going full humanist sans.</p>
<p><strong>Helvetica Neue.</strong> The one that's been right all along. Available on every Mac as a system font, which means it's free if your audience is on Apple hardware, and it has decades of design thinking baked into every spacing decision.</p>`,
  },
  {
    slug: "why-senior-ux-designers-suck",
    title: "Why senior and veteran UX designers suck",
    date: "Jan 12, 2022",
    dateISO: "2022-01-12",
    excerpt:
      "A more honest account of the failure modes that come with experience — and the habits that prevent them.",
    readingTimeMin: 5,
    content: `<h2>Experience creates shortcuts that stop working</h2>
<p>Senior designers are fast because they pattern-match. They've seen enough problems to know what solutions usually work. This is genuinely valuable — until the problem in front of them is slightly different from the pattern they're matching, and they don't slow down to notice.</p>
<p>Junior designers are slow because they question everything. This is inefficient and also how they learn. The failure mode of experience is learning to question less without maintaining the discipline to know when to question more.</p>
<h2>Portfolio work becomes the product</h2>
<p>After enough years in the industry, some designers start optimizing for impressive case studies rather than effective products. Decisions get made with an eye toward how they'll look in a Figma presentation rather than whether they'll work for users. The work starts looking better and performing worse.</p>
<h2>Seniority gets conflated with rightness</h2>
<p>The most dangerous version of this: a senior designer who's been right often enough that they stop treating their opinions as hypotheses. Good design is always a bet. The data from users is the resolution. Seniority doesn't change that — it just makes it easier to forget it.</p>
<h2>What actually works</h2>
<p>The senior designers I've most respected treat every project like they might be wrong about the solution. They bring pattern recognition to scope problems quickly, then apply genuine curiosity to the actual users of the actual product in front of them. They're fast and humble — not as opposites but as complements.</p>`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}
