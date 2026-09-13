"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  key: string;
  label: string;
  icon: string;
}

interface AdminTabsProps {
  menuItems: MenuItem[];
  activeTab: string;
}

export default function AdminTabs({ menuItems, activeTab }: AdminTabsProps) {
  return (
    <div className="bg-white border-b border-zinc-200 sticky top-0 z-10 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-3">
        {menuItems.map((item) => {
          const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[item.icon];
          const isActive = activeTab === item.key;
          
          return (
            <Link
              key={item.key}
              href={`/admin?tab=${item.key}`}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-shrink-0
                ${isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200/60"
                }
              `}
            >
              {IconComponent && <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />}
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
