"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

const links = [
  { href: "/account", label: "Account" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/subscriptions", label: "Services" },
  { href: "/usage", label: "Usage" },
  { href: "/settlements", label: "Settlements" },
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
    for (const link of links) {
      const active =
        pathname === link.href ||
        pathname.startsWith(link.href + "/")
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
  }, [pathname])

  return (
    <div className="relative">
      {/* desktop */}
      <div className="hidden sm:flex gap-4 text-sm text-oc-gray relative">
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
              className={`hover:text-white transition-colors duration-200 ${
                active ? "text-white" : ""
              }`}
            >
              {link.label}
            </Link>
          )
        })}
        <span
          className="absolute bottom-0 h-px bg-oc-light transition-all duration-300 ease-out"
          style={{
            left: `${indicator.left}px`,
            width: `${indicator.width}px`,
            transform: "translateY(6px)",
          }}
        />
      </div>

      {/* mobile */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-sm text-oc-gray hover:text-white transition"
        >
          <span>{activeLabel}</span>
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
          <div className="absolute top-full right-0 mt-2 w-40 border border-white/5 bg-oc-black rounded-md z-20">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 text-sm hover:text-white transition-colors duration-200 ${
                    active
                      ? "text-white bg-white/5"
                      : "text-oc-gray"
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
