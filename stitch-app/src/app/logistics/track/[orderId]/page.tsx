'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Truck, MapPin, Thermometer, ShieldCheck, QrCode } from 'lucide-react';

export default function ReeferTrackingPage({ params }: { params: { orderId: string } }) {
  const shipment = {
    orderId: params.orderId || 'ORD-99812',
    driverName: 'Santosh Shinde',
    vehicleNo: 'MH-15-EG-4412 (Eicher Reefer)',
    tempC: '+4.2°C',
    humidity: '88%',
    doorStatus: 'Closed / Locked',
    origin: 'Pimpalgaon Baswant, Nashik',
    destination: 'Bhiwandi Cold Chain Terminal Bay #2',
    eta: 'Today, 04:30 PM (28 km remaining)',
    status: 'in_transit',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`In-Transit Reefer GPS Tracking: ${shipment.orderId}`}
        subtitle={`Vehicle ${shipment.vehicleNo} • Driver: ${shipment.driverName}`}
        badge="IoT Sensor Active"
        action={
          <Link href={`/logistics/gate-pass/${shipment.orderId}`}>
            <Button size="md">
              <QrCode className="w-4 h-4" />
              <span>Show Gate Pass QR</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Reefer Temperature" value={shipment.tempC} subtitle="Target range: +3°C to +5°C" icon={<Thermometer className="w-5 h-5" />} />
        <MetricCard title="Relative Humidity" value={shipment.humidity} subtitle="Optimal for Allium Curing" icon={<Truck className="w-5 h-5" />} />
        <MetricCard title="Container Door Sensor" value={shipment.doorStatus} subtitle="Zero Unscheduled Openings" icon={<ShieldCheck className="w-5 h-5" />} />
        <MetricCard title="Estimated Arrival" value="04:30 PM" subtitle={shipment.eta} icon={<MapPin className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <CardPanel title="Live GPS Route Progress Map">
            <div className="bg-[#19201D] text-white p-6 rounded-xl space-y-4 text-xs font-mono border border-emerald-950">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>GPS TELEMETRY FEED: ONLINE</span>
                <span>LAT: 19.2812 N • LON: 73.0488 E</span>
              </div>
              <div className="p-4 bg-black/40 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Origin: {shipment.origin}</span>
                  <span className="text-emerald-400">PASSED [09:30 AM]</span>
                </div>
                <div className="flex justify-between font-bold text-amber-300">
                  <span>Current Location: Kasara Ghat Bypass</span>
                  <span>EN ROUTE [54 km/h]</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Destination: {shipment.destination}</span>
                  <span>ETA: 04:30 PM</span>
                </div>
              </div>
            </div>
          </CardPanel>
        </div>

        <div className="space-y-6">
          <CardPanel title="Discharge Yard Instructions">
            <div className="space-y-3 text-xs">
              <p className="text-gray-600">Present Gate Pass QR upon arrival at Bhiwandi Terminal Bay #2 for weight sampling & NABL re-check.</p>
              <Link href={`/logistics/gate-pass/${shipment.orderId}`}>
                <Button size="md" className="w-full">Open Dock Gate Pass</Button>
              </Link>
            </div>
          </CardPanel>
        </div>
      </div>
    </div>
  );
}
