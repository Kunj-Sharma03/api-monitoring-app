"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BarChartIcon,
  BellIcon,
  SettingsIcon,
  MonitorIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import Silk from "@/components/background/Silk";
import useAuthToken from "@/hooks/useAuthToken";

export default function Layout({ children }) {
  const pathname = usePathname();
  const { token, loading } = useAuthToken();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex min-h-screen w-full bg-[var(--color-bg)] bg-opacity-80">
      {/* Silk background - Fixed for mobile */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--color-surface)] bg-opacity-90 border border-[var(--color-border)] rounded-lg backdrop-blur-sm"
      >
        {isMobileMenuOpen ? (
          <XIcon className="h-6 w-6 text-[var(--color-text-primary)]" />
        ) : (
          <MenuIcon className="h-6 w-6 text-[var(--color-text-primary)]" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative z-50 lg:z-10
          bg-[var(--color-surface)] bg-opacity-90 backdrop-blur-sm
          min-h-screen border-r border-[var(--color-border)]
          transition-transform duration-300 ease-in-out
          w-64 lg:w-auto
        `}
        style={{ 
          minWidth: isMobileMenuOpen ? "256px" : "64px",
          maxWidth: isMobileMenuOpen ? "256px" : "240px"
        }}
      >
        <SidebarProvider defaultOpen={isMobileMenuOpen}>
          <Sidebar
            collapsible={isMobileMenuOpen ? "none" : "icon"}
            className="bg-transparent border-none min-h-screen w-full"
          >
            <SidebarContent className="flex flex-col h-full">
              {/* Logo */}
              <SidebarHeader className="flex items-center justify-start p-4 border-b border-[var(--color-border)]">
                <Link
                  href="/"
                  className="flex items-center justify-start w-full gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <img
                    src="/logo192.png"
                    alt="Logo"
                    className="w-8 h-8 md:w-10 md:h-10 object-contain"
                  />
                  <span className={`sidebar-label font-bold text-xl text-[var(--color-text-primary)] ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
                    AP-Eye
                  </span>
                </Link>
              </SidebarHeader>

              {/* Navigation Links */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard"}
                    className="flex items-center px-4 py-2 gap-3"
                  >
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <HomeIcon className="h-5 w-5" />
                      <span className={`sidebar-label ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/monitors"}
                    className="flex items-center px-4 py-2 gap-3"
                  >
                    <Link
                      href="/dashboard/monitors"
                      className="flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <MonitorIcon className="h-5 w-5" />
                      <span className={`sidebar-label ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Monitors</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/analytics"}
                    className="flex items-center px-4 py-2 gap-3"
                  >
                    <Link
                      href="/dashboard/analytics"
                      className="flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BarChartIcon className="h-5 w-5" />
                      <span className={`sidebar-label ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/alerts"}
                    className="flex items-center px-4 py-2 gap-3"
                  >
                    <Link
                      href="/dashboard/alerts"
                      className="flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BellIcon className="h-5 w-5" />
                      <span className={`sidebar-label ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Alerts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/settings"}
                    className="flex items-center px-4 py-2 gap-3"
                  >
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <SettingsIcon className="h-5 w-5" />
                      <span className={`sidebar-label ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-[var(--color-bg)] bg-opacity-80 text-[var(--color-text-primary)] lg:ml-0 relative z-10 pt-16 lg:pt-0 px-4 lg:px-6">
        {children}
      </main>
    </div>
  );
}
