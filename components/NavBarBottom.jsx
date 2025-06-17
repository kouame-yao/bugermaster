import { Bell, Calendar, ChartSpline, House, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const link = [
  { name: "Acceuil", icon: <House />, href: "/home" },
  { name: "Mois", icon: <Calendar />, href: "/mois" },
  { name: "Année", icon: <ChartSpline />, href: "/annee" },
  { name: "Alertes", icon: <Bell />, href: "/alerts" },
  { name: "Reglages", icon: <Settings />, href: "/settings" },
];

export default function NavBarBottom() {
  const patham = usePathname();
  return (
    <div className="flex items-center justify-center gap-8">
      {link.map((item, index) => (
        <Link href={item.href} key={index}>
          <div
            className={` ${
              patham === item.href ? "text-blue-500" : ""
            } flex flex-col items-center py-2`}
          >
            {item.icon} {item.name}
          </div>
        </Link>
      ))}
    </div>
  );
}
