/* V4 lab · content.js
   Textos del portfolio (en inglés). Los de los sentidos son los validados en DESIGN-V3.md (3.3).
   Las tarjetas de Shuffle my skills salen del About y los mantras validados de V3: la selección
   y los títulos cortos son una propuesta pendiente de validar. */
(function (global) {
  'use strict';
  const SENSES = [
    { id: 'listen', act: 'Act I', name: 'Listen', title: 'I listen.', tagline: 'Understanding people before defining problems.',
      text: 'Listening to users, teams and stakeholders to uncover needs, challenge assumptions and consider different perspectives.' },
    { id: 'see', act: 'Act II', name: 'See', title: 'I see.', tagline: 'Seeing the bigger picture.',
      text: 'Connecting user insights, business goals and data to identify opportunities and decide what matters most.' },
    { id: 'speak', act: 'Act III', name: 'Speak', title: 'I speak.', tagline: 'The user’s voice, even when they’re not in the room.',
      text: 'Turning research into clear stories that guide decisions, communicate priorities and keep teams aligned around real user needs.' },
    { id: 'taste', act: 'Act IV', name: 'Taste', title: 'I taste.', tagline: 'Good design takes good taste.',
      text: 'Applying visual craft, creativity and aesthetic judgement to create intuitive, cohesive and distinctive product experiences.' },
    { id: 'make', act: 'Act V', name: 'Make', title: 'I make.', tagline: 'Beyond ideas and prototypes.',
      text: 'Designing, prototyping and building with AI tools to turn concepts into working products, ready to launch, test and improve.' }
  ];

  const SKILLS = [
    { tag: 'Where I started', title: 'Words came first.', text: 'Before product, there were stories. I started my career in scriptwriting and copywriting.' },
    { tag: 'How I work', title: 'Holistic by default.', text: 'Connecting people, business, technology and design into one body of work.' },
    { tag: 'Experience', title: 'Five years in startups.', text: 'B2B and B2C products, from PropTech tools to EdTech learning experiences.' },
    { tag: 'Mantra', title: 'Question everything.', text: 'Doubt isn’t a roadblock, but an opportunity.' },
    { tag: 'Mantra', title: 'Launch before you have all the answers.', text: 'In theatre, a play comes together when it meets its audience.' },
    { tag: 'Make', title: 'I build with AI.', text: 'Designing, prototyping and building with AI tools to turn concepts into working products.' },
    { tag: 'Mantra', title: 'Everyone should share the same direction.', text: 'The strategy may change along the way, but the destination must be shared.' },
    { tag: 'Outside work', title: 'Around a stage.', text: 'I act, write scripts and work behind the scenes in theatre. I’m also part of El Chispazo.' }
  ];

  // Mantras validados en V3 (DESIGN-V3.md 3.5), sin "Listen to every voice".
  const MANTRAS = [
    { title: 'Question everything.', text: 'Doubt isn’t a roadblock, but an opportunity. Asking questions opens the door to new ideas and reveals other ways forward.' },
    { title: 'Launch before you have all the answers.', text: 'In theatre, a play comes together when it meets its audience. Shipping early makes it possible to test hypotheses against real results and find out whether an idea works.' },
    { title: 'Everyone should share the same direction.', text: 'To reach the right destination, the whole team needs to understand which problem it is solving and what goal it is pursuing. The strategy may change along the way, but the destination must be shared.' },
    { title: 'Never lose sight of what it’s for.', text: 'For centuries, philosophy has asked why and what for. These questions help determine what to do and why it matters. Without them, it’s easy to fall in love with an output that creates no real change.' }
  ];

  const PROJECTS = [
    { company: 'Ucademy', name: 'Student Dashboard' }, { company: 'Ucademy', name: 'Practice' },
    { company: 'Dino', name: 'Dino' }, { company: 'Dino', name: 'Dino Design System' },
    { company: 'Quota', name: 'Quota PMS' }, { company: 'Quota', name: 'Tenant Scoring' },
    { company: 'WOW', name: 'WOW' }
  ];

  // Reviews de la home (rondas 28-29), traducidas del español; Ema confirmó el permiso para publicar.
  // Rafael: formulario "Encuesta de Habilidades - Feedback" (17 de septiembre de 2026). Fran (Barrios Activos), Gianina (jefa) y Lucia
  // (design lead): recomendaciones de LinkedIn (2020, 2021 y 2026). Solo el nombre de pila (ronda 30). La última de la lista queda arriba de la pila.
  const REVIEWS = [
    { name: 'Gianina', initials: 'G', context: 'Emilia’s manager',
      text: 'Emilia is the person you want to work with: 100% committed, passionate about what she takes on, enthusiastic, solution-oriented, self-taught, always eager to learn, to innovate, to do better. She works with total professionalism and quality in her results and, at the same time, with great humanity. She builds excellent relationships with people. It’s a pleasure to work with her!' },
    { name: 'Fran', initials: 'F', context: 'Worked with Emilia at Barrios Activos',
      text: 'I worked with Emilia on a Growth project for an online social change platform. Her work as communication coordinator, user support lead and in planning new strategies was key to the results we achieved. I learnt a lot from her skills as a writer and designer, and from how effectively she led the project. Her ability to coordinate teams and her communication skills make the difference.' },
    { name: 'Rafael', initials: 'R', context: 'Worked with Emilia at Ucademy',
      text: 'Although Emi has an overwhelming capacity for execution that brings a lot of value to any company, she has the right skills to lead a team. I believe in her decision-making, her social skills to handle situations and, above all, her empathy to understand different positions and give her opinion without affecting anyone negatively, neither the person nor the company.' },
    { name: 'Lucia', initials: 'L', context: 'Design Lead at Ucademy',
      text: 'Working with Emi is a pleasure. She takes feedback very well and always constructively, something that isn’t easy to find and that I value enormously. She learns fast, genuinely cares about users, takes the time to talk to everyone involved so that research really has impact, and analyses metrics to evaluate next steps. I’d recommend her without a doubt for any team.' }
  ];

  global.V4 = { SENSES, SKILLS, MANTRAS, PROJECTS, REVIEWS };
})(window);
