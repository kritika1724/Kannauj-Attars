import { useParams } from 'react-router-dom'
import { useTaxonomy } from '../../components/TaxonomyProvider'
import { getPurposeCollectionMeta } from '../../config/collections'
import CollectionCatalog from './CollectionCatalog'

function PurposeCollection() {
  const { purposeId = '' } = useParams()
  const { purposeMap } = useTaxonomy()
  const fallbackTitle = purposeMap[purposeId] || 'Purpose Collection'
  const meta = getPurposeCollectionMeta(purposeId, fallbackTitle)

  return (
    <CollectionCatalog
      collectionKey={purposeId}
      title={meta.title}
      lead={meta.lead}
      heroAssetKey={`explore.purpose.${purposeId}`}
      membershipField="purposeTags"
      queryParam="purpose"
      heroFit="cover"
    />
  )
}

export default PurposeCollection
