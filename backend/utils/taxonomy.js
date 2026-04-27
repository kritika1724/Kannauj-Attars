const TaxonomyTerm = require('../models/TaxonomyTerm')
const { DEFAULT_TAXONOMY_TERMS } = require('../config/taxonomy')

const ensureDefaultTaxonomy = async () => {
  if (!Array.isArray(DEFAULT_TAXONOMY_TERMS) || DEFAULT_TAXONOMY_TERMS.length === 0) return

  await Promise.all(
    DEFAULT_TAXONOMY_TERMS.map((term) =>
      TaxonomyTerm.updateOne(
        { group: term.group, slug: term.slug },
        {
          $setOnInsert: {
            label: term.label,
            sortOrder: term.sortOrder,
            isActive: true,
          },
        },
        { upsert: true }
      )
    )
  )
}

const getTaxonomyPayload = async () => {
  const [purposes, families] = await Promise.all([
    TaxonomyTerm.find({ group: 'purpose', isActive: true })
      .sort({ sortOrder: 1, label: 1 })
      .select('slug label sortOrder')
      .lean(),
    TaxonomyTerm.find({ group: 'family', isActive: true })
      .sort({ sortOrder: 1, label: 1 })
      .select('slug label sortOrder')
      .lean(),
  ])

  return {
    purposes: purposes.map((term) => ({
      id: term.slug,
      label: term.label,
      sortOrder: term.sortOrder || 0,
    })),
    families: families.map((term) => ({
      id: term.slug,
      label: term.label,
      sortOrder: term.sortOrder || 0,
    })),
  }
}

module.exports = { ensureDefaultTaxonomy, getTaxonomyPayload }
