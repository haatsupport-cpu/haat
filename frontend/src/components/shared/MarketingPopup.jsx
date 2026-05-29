import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { checkoutService } from "../../services/checkout-service"
import { resolveAssetUrl } from "../../services/api"

const POPUP_STORAGE_KEY = "haatonline_popup_dismissed"

export default function MarketingPopup() {
  const [popup, setPopup] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let active = true

    const loadPopup = async () => {
      try {
        const response = await checkoutService.getPopupAd()
        const nextPopup = response.data?.popup
        if (!active || !nextPopup) return

        const dismissedId = localStorage.getItem(POPUP_STORAGE_KEY)
        if (dismissedId !== nextPopup.id) {
          setPopup(nextPopup)
          setVisible(true)
        }
      } catch {
        setPopup(null)
      }
    }

    loadPopup()
    return () => {
      active = false
    }
  }, [])

  if (!popup || !visible) return null

  const close = () => {
    localStorage.setItem(POPUP_STORAGE_KEY, popup.id)
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
          aria-label="Close popup"
        >
          <X size={18} />
        </button>
        {popup.imageUrl && (
          <img
            src={resolveAssetUrl(popup.imageUrl)}
            alt={popup.title || "Promotion"}
            className="max-h-[55vh] w-full object-cover"
          />
        )}
        {(popup.title || popup.textContent) && (
          <div className="space-y-2 p-5">
            {popup.title && <h2 className="text-xl font-bold text-slate-900">{popup.title}</h2>}
            {popup.textContent && <p className="text-sm leading-6 text-slate-600">{popup.textContent}</p>}
            {popup.targetLink && (
              <a
                href={popup.targetLink}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="mt-3 inline-flex rounded-2xl bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                View offer
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
