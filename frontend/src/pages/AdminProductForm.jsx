import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { api } from '../services/api'
import { toAssetUrl } from '../utils/media'
import { BUYER_TYPES, PURPOSE_TAGS, FAMILY_TAGS } from '../config/taxonomy'

const schema = yup.object({
  name: yup.string().required('Name is required.'),
  description: yup.string().required('Description is required.'),
  category: yup.string().required('Category is required.'),
  buyerType: yup.string().oneOf(['personal', 'industrial', 'both']).default('personal'),
  isBestSeller: yup.boolean().default(false),
  price: yup.number().typeError('Enter a valid price.').required('Price is required.'),
  stock: yup.number().typeError('Enter stock count.'),
  highlights: yup.string(),
})

function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = id && id !== 'new'
  const [images, setImages] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [packs, setPacks] = useState([{ label: '200 gm', price: '', stock: '' }])
  const [purposeTags, setPurposeTags] = useState([])
  const [familyTags, setFamilyTags] = useState([])
  const [message, setMessage] = useState('')

  const hasPacks = useMemo(() => packs.some((p) => (p.label || '').trim() && p.price !== ''), [packs])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  useEffect(() => {
    // Defaults for new products
    if (!isEditing) {
      setValue('buyerType', 'personal')
      setValue('isBestSeller', false)
    }
    if (!isEditing) return
    const load = async () => {
      const product = await api.getProduct(id)
      setValue('name', product.name)
      setValue('description', product.description)
      setValue('category', product.category)
      setValue('buyerType', product.buyerType || 'personal')
      setValue('isBestSeller', product.isBestSeller === true)
      setValue('price', product.price)
      setValue('stock', product.stock ?? 0)
      setValue('highlights', product.highlights?.join(', ') || '')
      setImages(product.images || [])
      setPurposeTags(Array.isArray(product.purposeTags) ? product.purposeTags : [])
      setFamilyTags(Array.isArray(product.familyTags) ? product.familyTags : [])
      if (Array.isArray(product.packs) && product.packs.length) {
        setPacks(
          product.packs.map((p) => ({
            label: p.label || '',
            price: p.price ?? '',
            stock: p.stock ?? '',
          }))
        )
      }
    }
    load()
  }, [id, isEditing, setValue])

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const response = await api.uploadImage(file)
      // Store relative paths when possible so deploy works without rewriting DB URLs.
      setImages((prev) => [...prev, response.url || response.absoluteUrl])
    } catch (error) {
      setMessage(error.message)
    }
  }

  const addImageUrl = () => {
    const trimmed = (imageUrl || '').trim()
    if (!trimmed) return
    setImages((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setImageUrl('')
  }

  const onSubmit = async (data) => {
    const normalizedPacks = packs
      .map((p) => ({
        label: (p.label || '').trim(),
        price: Number(p.price),
        stock: p.stock === '' || p.stock === undefined ? 0 : Number(p.stock),
      }))
      .filter((p) => p.label && !Number.isNaN(p.price))

    const payload = {
      ...data,
      price: Number(data.price),
      stock: data.stock === '' || data.stock === undefined ? 0 : Number(data.stock),
      highlights: data.highlights ? data.highlights.split(',').map((item) => item.trim()) : [],
      images,
      packs: normalizedPacks,
      purposeTags,
      familyTags,
    }

    try {
      if (isEditing) {
        await api.updateProduct(id, payload)
        setMessage('Product updated.')
      } else {
        await api.createProduct(payload)
        setMessage('Product created.')
      }
      setTimeout(() => navigate('/admin/products'), 800)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Admin</p>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            {isEditing ? 'Edit product' : 'Add product'}
          </h1>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-black/10">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div>
              <label className="text-sm font-semibold text-ink">Product name</label>
              <input
                {...register('name')}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
              />
              {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">Description</label>
              <textarea
                {...register('description')}
                rows="4"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
              />
              {errors.description && (
                <p className="mt-2 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-ink">Category</label>
                <input
                  {...register('category')}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
                {errors.category && (
                  <p className="mt-2 text-xs text-red-600">{errors.category.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">Price</label>
                <input
                  {...register('price')}
                  type="number"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
                {errors.price && <p className="mt-2 text-xs text-red-600">{errors.price.message}</p>}
                <p className="mt-2 text-xs text-muted">
                  Base price is used if you don’t add pack sizes below.
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">Stock</label>
                <input
                  {...register('stock')}
                  type="number"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
                {errors.stock && <p className="mt-2 text-xs text-red-600">{errors.stock.message}</p>}
                <p className="mt-2 text-xs text-muted">Optional if you manage stock by pack sizes.</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">Highlights (comma separated)</label>
                <input
                  {...register('highlights')}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-clay/50 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Merchandising</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">Explore placement</h3>
              <p className="mt-2 text-sm text-muted">
                Curate products on the Explore page for higher visibility.
              </p>

              <label className="mt-5 flex cursor-pointer items-start justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Best seller</p>
                  <p className="mt-1 text-xs text-muted">
                    If enabled, this product appears in Explore → Best sellers.
                  </p>
                </div>
                <input
                  type="checkbox"
                  {...register('isBestSeller')}
                  className="mt-1 h-5 w-5 accent-ember"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-clay/50 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Discovery</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">Shop by purpose & fragrance family</h3>
              <p className="mt-2 text-sm text-muted">
                These tags help customers browse faster (B2C) and also help bulk buyers find relevant materials (B2B).
              </p>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
                  <label className="text-sm font-semibold text-ink">Buyer type (B2C / B2B)</label>
                  <div className="mt-3 grid gap-2">
                    {BUYER_TYPES.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-ink hover:border-gold/40"
                      >
                        <span className="font-semibold">{opt.label}</span>
                        <input
                          type="radio"
                          value={opt.id}
                          {...register('buyerType')}
                          className="h-4 w-4 accent-ember"
                        />
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    Tip: Use “Both” if this product applies to personal buyers and bulk/industrial buyers.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
                  <label className="text-sm font-semibold text-ink">Shop by purpose</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PURPOSE_TAGS.map((tag) => {
                      const active = purposeTags.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            setPurposeTags((prev) =>
                              prev.includes(tag.id) ? prev.filter((x) => x !== tag.id) : [...prev, tag.id]
                            )
                          }
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                            active
                              ? 'bg-ember text-white'
                              : 'border border-slate-200 bg-white text-emberDark hover:border-gold/50'
                          }`}
                        >
                          {tag.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-6">
                    <label className="text-sm font-semibold text-ink">Fragrance family</label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {FAMILY_TAGS.map((tag) => {
                        const active = familyTags.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() =>
                              setFamilyTags((prev) =>
                                prev.includes(tag.id) ? prev.filter((x) => x !== tag.id) : [...prev, tag.id]
                              )
                            }
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              active
                                ? 'bg-ember text-white'
                                : 'border border-slate-200 bg-white text-emberDark hover:border-gold/50'
                            }`}
                          >
                            {tag.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted">
                    You can select multiple purposes/families (example: “Luxury gifting” + “Woody”).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-clay/50 p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted">Pack sizes</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">Add multiple pack options</h3>
                  <p className="mt-2 text-sm text-muted">
                    Example: 200 gm, 500 gm, 1 kg, 10 kg. Buyers can choose at checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPacks((prev) => [...prev, { label: '', price: '', stock: '' }])}
                  className="rounded-full bg-ember px-5 py-2 text-sm font-semibold text-white transition hover:bg-emberDark"
                >
                  + Add pack
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                {packs.map((p, idx) => (
                  <div
                    key={`${idx}-${p.label}`}
                    className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 md:grid-cols-[1.1fr_0.9fr_0.8fr_auto]"
                  >
                    <div>
                      <label className="text-xs font-semibold text-muted">Pack label</label>
                      <input
                        value={p.label}
                        onChange={(e) =>
                          setPacks((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x))
                          )
                        }
                        placeholder="200 gm"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted">Pack price (₹)</label>
                      <input
                        value={p.price}
                        onChange={(e) =>
                          setPacks((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x))
                          )
                        }
                        type="number"
                        placeholder="999"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted">Pack stock</label>
                      <input
                        value={p.stock}
                        onChange={(e) =>
                          setPacks((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, stock: e.target.value } : x))
                          )
                        }
                        type="number"
                        placeholder="0"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-ink"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setPacks((prev) => prev.filter((_, i) => i !== idx))}
                        className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:border-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!hasPacks && (
                <p className="mt-4 text-xs text-muted">
                  If you don’t add pack sizes, the product will use the base price above.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-ink">Upload images</label>
              <input
                type="file"
                onChange={handleImageUpload}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-ember file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-emberDark focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
              />
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL/path (e.g. /uploads/photo.jpg)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-emberDark"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {images.map((url) => (
                  <div key={url} className="rounded-2xl border border-slate-200/80 bg-clay/70 p-3">
                    <img
                      src={toAssetUrl(url, import.meta.env.VITE_API_ASSET)}
                      alt="upload"
                      className="h-40 w-full rounded-xl bg-white object-contain p-2"
                      loading="lazy"
                    />
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <p className="text-xs text-muted break-all">{url}</p>
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((x) => x !== url))}
                        className="shrink-0 rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-semibold text-red-600 hover:border-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white">
              Save product
            </button>
            {message && <p className="text-sm font-semibold text-emberDark">{message}</p>}
          </form>
        </div>
      </section>
    </div>
  )
}

export default AdminProductForm
