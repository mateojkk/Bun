"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/usage", label: "Usage" },
  { href: "/profile", label: "Profile" },
]

export default function NavLinks() {
  const pathname = usePathname() || ""
  const [open, setOpen] = useState(false)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const activeRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())

  const activeLabel = links.find(
    (l) => pathname === l.href || pathname.startsWith(l.href + "/")
  )?.label || "Menu"

  useEffect(() => {
    // slight delay to let font load / layout settle before measuring
    const measure = () => {
      for (const link of links) {
        const active = pathname === link.href || pathname.startsWith(link.href + "/")
        if (active) {
          const el = activeRefs.current.get(link.href)
          if (el) {
            const parent = el.parentElement
            if (parent) {
              const parentRect = parent.getBoundingClientRect()
              const elRect = el.getBoundingClientRect()
              setIndicator({
                left: elRect.left - parentRect.left,
                width: elRect.width,
              })
            }
          }
        }
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [pathname])

  return (
    <div className="relative">
      {/* desktop */}
      <div className="hidden sm:flex gap-4 text-sm text-black/50 relative">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              ref={(el) => {
                if (el) activeRefs.current.set(link.href, el)
              }}
              className={`py-4 transition-colors duration-300 relative ${
                active ? "text-black font-medium" : "hover:text-black"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
        <span
          className="absolute bottom-3 h-[2px] bg-black transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full"
          style={{
            left: `${indicator.left}px`,
            width: `${indicator.width}px`,
          }}
        />
      </div>

      {/* mobile */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-sm text-black/50 hover:text-black transition"
        >
          <span className="text-black font-medium">{activeLabel}</span>
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-2 w-48 border border-black/10 bg-white rounded-lg shadow-lg z-20 overflow-hidden">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    active ? "text-black font-medium bg-black/5" : "text-black/60 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
