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
import logo from "@/assets/crowdconnect-icon-1.png";




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
              <img src={logo} alt="crowd-connect-logo" className="h-8 w-8" />
              <span
                className="text-xl font-bold text-(--brand-primary)">
                Crowd Connect
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
          className="mt-5 rounded-lg p-3"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand and Copyright */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <img src={logo} alt="crowd-connect-logo" className="h-6 w-6" />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Crowd Connect
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                © {new Date().getFullYear()} All Rights Reserved
              </p>
            </div>

            {/* Contact Info - Horizontal */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: MapPin, text: "Kerala, India" },
                { icon: Phone, text: "+91 9633 699-766" },
                { icon: Mail, text: "hello@crowdconnect.com" },
              ].map((item) => (
                <div key={item.text} className="flex items-center space-x-1">
                  <item.icon className="w-3 h-3" style={{ color: "var(--brand-primary)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Policy Links - Pill Buttons */}
            <div className="flex gap-2">
              {["Privacy", "Terms", "Cookies"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="px-3 py-1 text-xs rounded-full transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-default)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--brand-primary)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--card-bg)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}