import {
  Calendar,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: "var(--card-bg)",
        borderTopColor: "var(--border-default)",
      }}
    >
      <div className="container px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar
                className="h-8 w-8"
                style={{ color: "var(--brand-primary)" }}
              />
              <span
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                EventHub
              </span>
            </div>

            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Discover amazing events and create unforgettable experiences in
              your city.
            </p>

            <div className="flex space-x-2">
              {[
                Facebook,
                Twitter,
                Instagram,
                Linkedin,
              ].map((Icon, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  style={{
                    color: "var(--text-secondary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      "var(--brand-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      "var(--text-secondary)")
                  }
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                "Browse Events",
                "Host an Event",
                "Pricing",
                "Help Center",
                "Contact Us",
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color =
                        "var(--brand-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--text-secondary)")
                    }
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Categories
            </h3>
            <ul className="space-y-2">
              {[
                "Music & Concerts",
                "Sports & Fitness",
                "Food & Drink",
                "Business & Networking",
                "Arts & Culture",
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color =
                        "var(--brand-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--text-secondary)")
                    }
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Stay Updated
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Get the latest events delivered to your inbox
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Enter your email"
              />
              <Button
                className="w-full"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--btn-primary-text)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--brand-primary-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--brand-primary)")
                }
              >
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          style={{ borderTopColor: "var(--border-default)" }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
            <div
              className="flex items-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Kerala, India
            </div>
            <div
              className="flex items-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <Phone className="w-4 h-4 mr-1" />
              (+91) 9633 699-766
            </div>
            <div
              className="flex items-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <Mail className="w-4 h-4 mr-1" />
              hello@crowdconnect.com
            </div>
          </div>

          <div className="flex space-x-6 text-sm mt-4 md:mt-0">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (label) => (
                <a
                  key={label}
                  href="#"
                  className="transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      "var(--brand-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      "var(--text-secondary)")
                  }
                >
                  {label}
                </a>
              )
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-2 pt-2 text-center">
          <p
            className="text-sm"
            style={{
              color: "var(--text-secondary)",
              borderTopColor: "var(--border-default)",
            }}
          >
            © {new Date().getFullYear()} Crowd Connect. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}