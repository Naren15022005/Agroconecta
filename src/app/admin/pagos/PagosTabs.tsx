'use client';

import * as Tabs from '@radix-ui/react-tabs';
import PagosByAgricultor from '@/components/PagosByAgricultor';
import PagosResumenDiario from '@/components/admin/PagosResumenDiario';

export default function PagosTabs() {
  return (
    <Tabs.Root defaultValue="pendientes" className="w-full">
      <Tabs.List className="flex flex-wrap gap-2 mb-6">
        <Tabs.Trigger
          value="pendientes"
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:border-cyan-600 bg-white/5 text-white border-white/10 hover:bg-white/10"
        >
          Vista normal
        </Tabs.Trigger>
        <Tabs.Trigger
          value="resumen"
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:border-cyan-600 bg-white/5 text-white border-white/10 hover:bg-white/10"
        >
          Resumen por día
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="pendientes">
        <PagosByAgricultor />
      </Tabs.Content>

      <Tabs.Content value="resumen">
        <PagosResumenDiario />
      </Tabs.Content>
    </Tabs.Root>
  );
}
