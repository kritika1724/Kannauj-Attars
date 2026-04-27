import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { BUYER_TYPES, PURPOSE_TAGS, FAMILY_TAGS } from '../config/taxonomy'

const TaxonomyContext = createContext({
  buyerTypes: BUYER_TYPES,
  purposes: PURPOSE_TAGS,
  families: FAMILY_TAGS,
  purposeMap: {},
  familyMap: {},
  loading: true,
  error: '',
  refresh: async () => {},
})

const makeLookupMap = (items = []) =>
  items.reduce((acc, item) => {
    if (item?.id) acc[item.id] = item.label || item.id
    return acc
  }, {})

export function TaxonomyProvider({ children }) {
  const [purposes, setPurposes] = useState(PURPOSE_TAGS)
  const [families, setFamilies] = useState(FAMILY_TAGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setError('')
      const data = await api.getTaxonomy()
      setPurposes(Array.isArray(data?.purposes) && data.purposes.length ? data.purposes : PURPOSE_TAGS)
      setFamilies(Array.isArray(data?.families) && data.families.length ? data.families : FAMILY_TAGS)
    } catch (err) {
      setError(err.message || 'Unable to load filters')
      setPurposes(PURPOSE_TAGS)
      setFamilies(FAMILY_TAGS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      buyerTypes: BUYER_TYPES,
      purposes,
      families,
      purposeMap: makeLookupMap(purposes),
      familyMap: makeLookupMap(families),
      loading,
      error,
      refresh,
    }),
    [purposes, families, loading, error, refresh]
  )

  return <TaxonomyContext.Provider value={value}>{children}</TaxonomyContext.Provider>
}

export const useTaxonomy = () => useContext(TaxonomyContext)
