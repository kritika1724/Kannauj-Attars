export const KNOWLEDGE_ARTICLES = [
  {
    slug: 'attar-vs-perfume',
    title: 'Attar vs Perfume: what’s the difference?',
    excerpt:
      'Attar is an oil-based perfume traditionally crafted by slow distillation, while modern perfumes are often alcohol-based. Here is a practical guide.',
    readTime: '4 min read',
    sections: [
      {
        heading: 'What is an attar?',
        paragraphs: [
          'Attar (also called itr/itra) is a concentrated perfume oil. It is typically alcohol-free, applied in small amounts, and designed to sit close to skin.',
          'Traditional Kannauj-style production often uses slow distillation (deg & bhapka) to capture aroma from botanicals into a base.',
        ],
      },
      {
        heading: 'What is a perfume?',
        paragraphs: [
          'Perfume is a broader category that commonly uses alcohol as a carrier. It usually projects more strongly and can feel lighter on skin because alcohol evaporates quickly.',
        ],
        bullets: [
          'Attar: oil-based, concentrated, small application',
          'Perfume: often alcohol-based, more projection, spray format',
        ],
      },
      {
        heading: 'Which one should you choose?',
        paragraphs: [
          'If you prefer a clean, long-wearing, skin-close scent, attars are a great fit. If you want higher projection and a spray experience, perfume may feel more familiar.',
          'For gifting and weddings, many buyers choose deeper profiles (woody/amber/oriental). For daily wear, lighter florals and fresh notes are popular.',
        ],
      },
    ],
    disclaimer:
      'Tip: Always patch test on skin. If you have sensitivities, consult a professional before applying fragrance oils.',
  },
  {
    slug: 'essential-oils-extraction',
    title: 'How essential oils are extracted (simple guide)',
    excerpt:
      'Steam distillation, cold pressing, and solvent extraction are common ways to obtain aromatic oils. Here’s what each method means.',
    readTime: '5 min read',
    sections: [
      {
        heading: 'Steam distillation',
        paragraphs: [
          'Steam passes through plant material and carries aromatic molecules into a condenser. The result separates into essential oil and hydrosol.',
          'This method is used for many herbs, spices, and woods.',
        ],
      },
      {
        heading: 'Cold pressing (for citrus)',
        paragraphs: [
          'Citrus oils are often extracted by pressing peels. It preserves bright, fresh top notes.',
        ],
      },
      {
        heading: 'Solvent extraction',
        paragraphs: [
          'Some delicate flowers yield better aroma through solvent extraction, producing “absolutes.” This is common in fine fragrance work.',
        ],
      },
    ],
    disclaimer:
      'Note: Essential oils are concentrated materials. Use responsibly and follow recommended dilution for skin application.',
  },
  {
    slug: 'aroma-chemicals',
    title: 'What are aroma chemicals?',
    excerpt:
      'Aroma chemicals are individual molecules (natural-identical or synthetic) used to build stable, consistent fragrance profiles for perfumery and manufacturing.',
    readTime: '4 min read',
    sections: [
      {
        heading: 'Why they exist',
        paragraphs: [
          'Natural materials can vary by season, origin, and processing. Aroma chemicals help maintain consistency, performance, and availability.',
        ],
      },
      {
        heading: 'Where they are used',
        paragraphs: [
          'They are commonly used in perfumes, soaps, detergents, candles, cosmetics, and industrial applications.',
        ],
        bullets: [
          'Better stability in finished products',
          'Repeatable scent profile at scale',
          'Wider palette for perfumers',
        ],
      },
      {
        heading: 'Safety & compliance',
        paragraphs: [
          'Responsible suppliers follow IFRA recommendations and provide documentation where applicable (MSDS/COA).',
        ],
      },
    ],
    disclaimer:
      'If you are buying for manufacturing, ask for safety documents and recommended usage levels for your product category.',
  },
  {
    slug: 'natural-vs-synthetic',
    title: 'Natural vs synthetic fragrance: the honest view',
    excerpt:
      '“Natural” does not automatically mean safer, and “synthetic” does not automatically mean harmful. Here’s how to think clearly about it.',
    readTime: '6 min read',
    sections: [
      {
        heading: 'Natural is still chemistry',
        paragraphs: [
          'Natural oils are mixtures of many molecules. Some people can be sensitive to specific components (even in natural materials).',
        ],
      },
      {
        heading: 'Synthetic can be cleaner',
        paragraphs: [
          'A single aroma molecule can be more predictable, stable, and easier to control in a formula compared to a variable natural mixture.',
        ],
      },
      {
        heading: 'What matters most',
        paragraphs: [
          'Quality, correct usage, transparency, and safety guidance matter more than labels. For personal wear, focus on how it smells, how it performs, and how your skin reacts.',
        ],
      },
    ],
    disclaimer:
      'Always follow safe usage guidelines and store materials properly to preserve quality.',
  },
  {
    slug: 'store-your-oils',
    title: 'How to store attars and oils for maximum life',
    excerpt:
      'Light, heat, and air are the main enemies of fragrance. A few simple habits can preserve aroma for longer.',
    readTime: '3 min read',
    sections: [
      {
        heading: 'Avoid heat and sunlight',
        paragraphs: [
          'Store in a cool, dark place. Direct sunlight and high temperatures can degrade delicate top notes and cause oxidation.',
        ],
      },
      {
        heading: 'Keep caps tight',
        paragraphs: [
          'Oxygen exposure slowly changes fragrance over time. Close bottles properly and avoid leaving them open.',
        ],
      },
      {
        heading: 'Use clean applicators',
        paragraphs: [
          'Avoid contamination (water, dust, skin residue). If you use a dabber, keep it clean and dry.',
        ],
      },
    ],
    disclaimer:
      'If a fragrance changes color slightly over time, it can be normal. If it smells “off,” stop use and contact the seller.',
  },
  {
    slug: 'ifra-safety',
    title: 'IFRA & safety guidelines: what buyers should know',
    excerpt:
      'IFRA provides recommendations for safe use of fragrance materials across product categories. Understanding the basics builds trust and transparency.',
    readTime: '5 min read',
    sections: [
      {
        heading: 'What is IFRA?',
        paragraphs: [
          'IFRA (International Fragrance Association) publishes standards and guidance for safe use of fragrance ingredients.',
        ],
      },
      {
        heading: 'Why it matters',
        paragraphs: [
          'For manufacturing (soaps, cosmetics, candles), compliance helps manage allergens, limits, and safe usage levels.',
        ],
      },
      {
        heading: 'Documents you may request (B2B)',
        paragraphs: [
          'Depending on materials, suppliers may provide MSDS, COA, allergen declarations, and storage/handling guidance.',
        ],
        bullets: ['MSDS (Material Safety Data Sheet)', 'COA (Certificate of Analysis)', 'Recommended usage levels'],
      },
    ],
    disclaimer:
      'This content is informational and not legal advice. Always follow local regulations and category-specific guidance.',
  },
]

export const getKnowledgeArticle = (slug) =>
  KNOWLEDGE_ARTICLES.find((a) => a.slug === slug) || null

