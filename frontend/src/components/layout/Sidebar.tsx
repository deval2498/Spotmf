"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarSubItem {
  title: string;
  href: string;
}

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarSubItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    title: "Strategy",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    children: [
      { title: "SIP Strategy", href: "/dashboard/sip" },
      { title: "DMA Strategy", href: "/dashboard/dma" },
    ],
  },
  {
    title: "Portfolio",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    children: [
      { title: "Active Strategies", href: "/dashboard/portfolio/active" },
      { title: "Wallet Overview", href: "/dashboard/portfolio/wallet" },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Strategy",
    "Portfolio",
  ]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
    // Collapse all sections when sidebar is collapsed
    if (!isCollapsed) {
      setExpandedSections([]);
    } else {
      // Expand default sections when sidebar is expanded
      setExpandedSections(["Strategy", "Portfolio"]);
    }
  };

  const isChildActive = (children?: SidebarSubItem[]) => {
    if (!children) return false;
    return children.some((child) => pathname === child.href);
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo/Brand and Collapse Button */}
      <div className="flex h-16 items-center justify-between px-3">
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">SpotMF</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn(
            "h-8 w-8 p-0",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {sidebarItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedSections.includes(item.title);
          const isActive = item.href ? pathname === item.href : false;
          const hasActiveChild = isChildActive(item.children);

          return (
            <div key={item.title}>
              {/* Parent Item */}
              {hasChildren ? (
                <Button
                  variant="ghost"
                  onClick={() => !isCollapsed && toggleSection(item.title)}
                  className={cn(
                    "w-full h-auto text-sm font-medium",
                    isCollapsed
                      ? "justify-center px-0 py-2"
                      : "justify-start gap-3 px-3 py-2",
                    hasActiveChild && "text-foreground"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      <svg
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                </Button>
              ) : (
                <Link href={item.href!}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-auto text-sm font-medium",
                      isCollapsed
                        ? "justify-center px-0 py-2"
                        : "justify-start gap-3 px-3 py-2",
                      isActive && "bg-secondary"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              )}

              {/* Child Items - Only show when not collapsed */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-4">
                  {item.children!.map((child) => {
                    const isChildItemActive = pathname === child.href;
                    return (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant={isChildItemActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start px-3 py-1.5 h-auto text-sm font-normal",
                            isChildItemActive && "bg-secondary font-medium"
                          )}
                        >
                          {child.title}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className={cn("p-4", isCollapsed && "p-2")}>
        {isCollapsed ? (
          <Button
            size="sm"
            className="w-full h-10 p-0"
            title="Connect Wallet"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </Button>
        ) : (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Connect your wallet to get started
            </p>
            <Button size="sm" className="mt-2 w-full text-sm font-medium">
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
