"use client";

// import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BarChartIcon,
  BellIcon,
  SettingsIcon,
  MonitorIcon,
} from "lucide-react";
import Silk from "@/components/background/Silk";
import useAuthToken from "@/hooks/useAuthToken";
export default function Layout({ children }) {
  const pathname = usePathname();
  const { loading } = useAuthToken();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="dashboard-container relative flex min-h-screen w-full bg-[var(--color-bg)] bg-opacity-80">
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

        {/* Sidebar */}
        <Sidebar
          collapsible="icon"
          className="bg-[var(--color-surface)] bg-opacity-90 backdrop-blur-sm border-r border-[var(--color-border)]"
        >
          <SidebarContent className="flex flex-col h-full">
            {/* Logo */}
            <SidebarHeader className="flex items-center justify-start p-4 border-b border-[var(--color-border)]">
              <Link
                href="/"
                className="flex items-center justify-start w-full gap-3"
              >
                <img
                  src="/logo192.png"
                  alt="Logo"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
                <span className="sidebar-label font-bold text-xl text-[var(--color-text-primary)]">
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
                  >
                    <HomeIcon className="h-5 w-5" />
                    <span className="sidebar-label">Home</span>
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
                  >
                    <MonitorIcon className="h-5 w-5" />
                    <span className="sidebar-label">Monitors</span>
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
                  >
                    <BarChartIcon className="h-5 w-5" />
                    <span className="sidebar-label">Analytics</span>
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
                  >
                    <BellIcon className="h-5 w-5" />
                    <span className="sidebar-label">Alerts</span>
                  </Link>
                </SidebarMenuButton>              
                </SidebarMenuItem>
            </SidebarMenu>

            {/* Bottom items */}
            <div className="flex flex-col items-center w-full mt-auto mb-4 gap-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/settings"}
                    className="flex items-center px-4 py-2 gap-3"
                  >
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3"
                    >
                      <SettingsIcon className="h-5 w-5" />
                      <span className="sidebar-label">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {/* Account avatar */}
              <div className="flex flex-col items-center w-full">
                <div className="w-full flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-hover)] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[var(--color-text-secondary)]">
                      A
                    </span>
                  </div>
                </div>
                <span className="sidebar-label text-xs text-[var(--color-text-secondary)] whitespace-nowrap overflow-hidden mt-1 text-center">
                  Account
                </span>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main content slot */}
        <main className="flex-1 min-h-screen bg-[var(--color-bg)] bg-opacity-80 text-[var(--color-text-primary)]">
          {/* Mobile menu trigger */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <SidebarTrigger className="bg-[var(--color-surface)] bg-opacity-90 backdrop-blur-sm border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]" />
          </div>
          {children}
        </main>
      </div>
        </SidebarProvider>
      );
    }
