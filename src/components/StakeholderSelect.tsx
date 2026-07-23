"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Tractor, Building2, Check } from "lucide-react";

interface RoleOption {
  value: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roles: RoleOption[] = [
  {
    value: "CAMPESINO",
    label: "Campesino / Agricultor",
    subtitle: "Publica y vende tus productos directamente",
    icon: Tractor,
  },
  {
    value: "COMPRADOR",
    label: "Cliente Individual",
    subtitle: "Compra productos frescos del campo",
    icon: User,
  },
  {
    value: "EMPRESA",
    label: "Empresa / Mayorista",
    subtitle: "Compras al por mayor y convenios directo",
    icon: Building2,
  },
];

export default function StakeholderSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRole = roles.find((r) => r.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input for standard form submission */}
      <input type="hidden" name="role" value={value} required />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 shadow-sm ${
          isOpen
            ? "bg-neutral-800 border-lime-500 ring-2 ring-lime-500/20 text-white"
            : value
            ? "bg-neutral-800/90 border-neutral-700 text-white hover:border-neutral-600"
            : "bg-neutral-800/90 border-neutral-700 text-neutral-400 hover:border-neutral-600"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedRole ? (
            <>
              <div className="p-1.5 rounded-lg bg-lime-500/10 text-lime-400 flex-shrink-0">
                <selectedRole.icon className="w-4 h-4" />
              </div>
              <span className="truncate font-semibold text-white">
                {selectedRole.label}
              </span>
            </>
          ) : (
            <span className="truncate">Selecciona tu tipo de usuario</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-lime-400" : ""
          }`}
        />
      </button>

      {/* Custom Dark Dropdown Options Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl backdrop-blur-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {roles.map((role) => {
            const isSelected = role.value === value;
            const Icon = role.icon;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => {
                  onChange(role.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-150 ${
                  isSelected
                    ? "bg-lime-500/15 text-white border border-lime-500/30"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                      isSelected
                        ? "bg-lime-500 text-neutral-950"
                        : "bg-neutral-800 text-neutral-400 group-hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">
                      {role.label}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                      {role.subtitle}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-lime-400 flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
