/* Settings Module */
import {
  Cpu, Fan, Truck, Bell, Database, Save,
  Plus, Trash2, Edit,
  Settings as SettingsIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

/* ─── mock data ─── */

const tabItems = [
  { value: 'devices', label: 'Devices', icon: Cpu },
  { value: 'ventilation', label: 'Ventilation', icon: Fan },
  { value: 'fleet', label: 'Fleet & Workers', icon: Truck },
  { value: 'alerts', label: 'Alerts', icon: Bell },
  { value: 'data', label: 'Data & System', icon: Database },
];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card/80 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5 flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ─── Tab Content Components ─── */



function DevicesTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="IoT Device Configuration" description="Manage sensors, gateways, and tracking hardware.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Default Reporting Frequency</Label>
            <Select defaultValue="30"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="5">5 seconds</SelectItem><SelectItem value="10">10 seconds</SelectItem><SelectItem value="30">30 seconds</SelectItem><SelectItem value="60">60 seconds</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <SettingRow label="Auto-Discovery" description="Automatically detect new IoT devices on the network."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Calibration Reminders" description="Send alerts when devices need recalibration."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Firmware Auto-Update" description="Allow OTA firmware updates for connected devices."><Switch /></SettingRow>
      </SectionCard>
      <SectionCard title="Calibration Schedule" description="Set calibration parameters for device types.">
        <div className="space-y-3">
          {[{ type: 'Gas Sensors', interval: '30 days' }, { type: 'Temperature Probes', interval: '90 days' }, { type: 'Airflow Meters', interval: '60 days' }, { type: 'Dust Sensors', interval: '45 days' }].map((d, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded border border-border/40 bg-muted/10">
              <span className="text-sm">{d.type}</span>
              <Select defaultValue={d.interval}><SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="30 days">30 days</SelectItem><SelectItem value="45 days">45 days</SelectItem><SelectItem value="60 days">60 days</SelectItem><SelectItem value="90 days">90 days</SelectItem></SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function VentilationTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Fan Parameters" description="Configure operational limits for ventilation fans.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Minimum Fan Speed (%)</Label>
            <Slider defaultValue={[20]} max={100} step={5} />
            <p className="text-xs text-muted-foreground">Current: 20%</p>
          </div>
          <div className="space-y-2">
            <Label>Maximum Fan Speed (%)</Label>
            <Slider defaultValue={[95]} max={100} step={5} />
            <p className="text-xs text-muted-foreground">Current: 95%</p>
          </div>
          <div className="space-y-2">
            <Label>Ramp-Up Time (seconds)</Label>
            <Input type="number" defaultValue="15" className="w-32" />
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Automation Rules" description="Define conditions for automatic ventilation adjustments.">
        <SettingRow label="Auto VoD Mode" description="Enable Ventilation-on-Demand based on sensor readings."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Manual Override" description="Allow operators to manually control fan speeds."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Emergency Boost" description="Auto-activate maximum ventilation during gas alerts."><Switch defaultChecked /></SettingRow>
        <Separator />
        <div className="space-y-2">
          <Label>Damper Control Logic</Label>
          <Select defaultValue="proportional"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="proportional">Proportional</SelectItem><SelectItem value="on-off">On/Off</SelectItem><SelectItem value="pid">PID Control</SelectItem></SelectContent>
          </Select>
        </div>
      </SectionCard>
    </div>
  );
}



function FleetWorkersTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Worker Tracking" description="Configure worker location and safety monitoring.">
        <div className="space-y-2">
          <Label>Tracking Technology</Label>
          <Select defaultValue="ble"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ble">BLE Beacons</SelectItem><SelectItem value="rfid">RFID</SelectItem><SelectItem value="uwb">UWB</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent>
          </Select>
        </div>
        <SettingRow label="Location Refresh Rate" description="How often worker positions are updated.">
          <Select defaultValue="5"><SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="1">1 sec</SelectItem><SelectItem value="5">5 sec</SelectItem><SelectItem value="10">10 sec</SelectItem></SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Proximity Alerts" description="Alert when workers enter restricted zones."><Switch defaultChecked /></SettingRow>
        <SettingRow label="SOS Button Enabled" description="Allow workers to trigger emergency via wearable."><Switch defaultChecked /></SettingRow>
      </SectionCard>
      <SectionCard title="Fleet Configuration" description="Configure vehicle tracking and emission factors.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Vehicle Emission Factor (g CO/km)</Label><Input type="number" defaultValue="2.5" /></div>
          <div className="space-y-2"><Label>Max Speed Underground (km/h)</Label><Input type="number" defaultValue="25" /></div>
        </div>
        <SettingRow label="Idle Detection" description="Alert when vehicle idles for too long."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Geo-Fencing" description="Restrict vehicles to designated zones."><Switch defaultChecked /></SettingRow>
      </SectionCard>
    </div>
  );
}

function AlertsTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Gas Thresholds" description="Define warning and critical levels for gas concentrations.">
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/30 text-left">
              <th className="px-3 py-2 font-medium">Gas</th><th className="px-3 py-2 font-medium">Unit</th>
              <th className="px-3 py-2 font-medium">Warning</th><th className="px-3 py-2 font-medium">Critical</th>
            </tr></thead>
            <tbody>
              {[{ gas: 'CO', unit: 'ppm', warn: '25', crit: '50' }, { gas: 'CH₄', unit: '%LEL', warn: '1.0', crit: '2.0' }, { gas: 'NO₂', unit: 'ppm', warn: '3', crit: '5' }, { gas: 'O₂', unit: '%', warn: '19.5', crit: '18.0' }].map((g, i) => (
                <tr key={i} className="border-t border-border/30">
                  <td className="px-3 py-2.5 font-medium">{g.gas}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{g.unit}</td>
                  <td className="px-3 py-2.5"><Input defaultValue={g.warn} className="h-7 w-20" /></td>
                  <td className="px-3 py-2.5"><Input defaultValue={g.crit} className="h-7 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="Environmental Thresholds" description="Temperature and air quality limits.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Temperature Warning (°C)</Label><Input type="number" defaultValue="35" /></div>
          <div className="space-y-2"><Label>Temperature Critical (°C)</Label><Input type="number" defaultValue="40" /></div>
          <div className="space-y-2"><Label>AQI Warning Level</Label><Input type="number" defaultValue="150" /></div>
          <div className="space-y-2"><Label>AQI Critical Level</Label><Input type="number" defaultValue="200" /></div>
        </div>
      </SectionCard>
      <SectionCard title="Notification Channels" description="Choose how alerts are delivered.">
        <SettingRow label="In-App Notifications" description="Show alerts in the application dashboard."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Email Alerts" description="Send email notifications to assigned personnel."><Switch defaultChecked /></SettingRow>
        <SettingRow label="SMS Alerts" description="Send SMS for critical-level events."><Switch /></SettingRow>
        <SettingRow label="Push Notifications" description="Mobile push notifications for field workers."><Switch defaultChecked /></SettingRow>
        <Separator />
        <div className="space-y-2">
          <Label>Alert Escalation Time (minutes)</Label>
          <Input type="number" defaultValue="5" className="w-32" />
          <p className="text-xs text-muted-foreground">Time before unacknowledged alerts escalate to next level.</p>
        </div>
      </SectionCard>
    </div>
  );
}



function DataSystemTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Data Retention" description="Configure how long historical data is stored.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Sensor Data Retention</Label>
            <Select defaultValue="90"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="180">180 days</SelectItem><SelectItem value="365">1 year</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Alert Log Retention</Label>
            <Select defaultValue="365"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="90">90 days</SelectItem><SelectItem value="180">180 days</SelectItem><SelectItem value="365">1 year</SelectItem><SelectItem value="730">2 years</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="System Configuration" description="General system performance settings.">
        <div className="space-y-2"><Label>Dashboard Refresh Interval (seconds)</Label><Input type="number" defaultValue="5" className="w-32" /></div>
        <div className="space-y-2"><Label>Data Aggregation Window</Label>
          <Select defaultValue="1min"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="10s">10 seconds</SelectItem><SelectItem value="30s">30 seconds</SelectItem><SelectItem value="1min">1 minute</SelectItem><SelectItem value="5min">5 minutes</SelectItem></SelectContent>
          </Select>
        </div>
        <SettingRow label="Audit Trail" description="Log all configuration changes and user actions."><Switch defaultChecked /></SettingRow>
      </SectionCard>
      <SectionCard title="Backup & Restore" description="Manage system backups.">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Create Backup</Button>
          <Button variant="outline" size="sm">Restore from Backup</Button>
          <Button variant="outline" size="sm">Export Logs</Button>
        </div>
        <p className="text-xs text-muted-foreground">Last backup: 2 hours ago · Size: 245 MB</p>
      </SectionCard>
    </div>
  );
}



/* ─── Main Settings Page ─── */
export default function Settings() {
  const handleSave = () => toast.success('Settings saved successfully');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" /> Settings
          </h2>
          <p className="text-sm text-muted-foreground">Configure system parameters, manage users, and control integrations.</p>
        </div>
        <Button onClick={handleSave} className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1.5 rounded-lg">
          {tabItems.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="devices"><DevicesTab /></TabsContent>
        <TabsContent value="ventilation"><VentilationTab /></TabsContent>
        <TabsContent value="fleet"><FleetWorkersTab /></TabsContent>
        <TabsContent value="alerts"><AlertsTab /></TabsContent>
        <TabsContent value="data"><DataSystemTab /></TabsContent>
      </Tabs>
    </div>
  );
}
