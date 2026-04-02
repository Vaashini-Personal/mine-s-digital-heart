import { useState } from 'react';
import {
  Users, Mountain, Cpu, Fan, Box, Truck, Bell, Plug, Database, Shield, Palette, Save,
  Plus, Trash2, Edit, ToggleLeft, ToggleRight, ChevronDown, Lock, Mail, Smartphone,
  Wifi, Radio, Settings as SettingsIcon
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
const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@smartmine.io', role: 'Super Admin', status: 'Active' },
  { id: 2, name: 'John Operator', email: 'john@smartmine.io', role: 'Operator', status: 'Active' },
  { id: 3, name: 'Sarah Engineer', email: 'sarah@smartmine.io', role: 'Engineer', status: 'Active' },
  { id: 4, name: 'Mike Viewer', email: 'mike@smartmine.io', role: 'Viewer', status: 'Inactive' },
];
const roles = ['Super Admin', 'Admin', 'Operator', 'Engineer', 'Viewer'];

const tabItems = [
  { value: 'users', label: 'Users & Roles', icon: Users },
  { value: 'mine', label: 'Mine Config', icon: Mountain },
  { value: 'devices', label: 'Devices', icon: Cpu },
  { value: 'ventilation', label: 'Ventilation', icon: Fan },
  { value: 'twin', label: 'Digital Twin', icon: Box },
  { value: 'fleet', label: 'Fleet & Workers', icon: Truck },
  { value: 'alerts', label: 'Alerts', icon: Bell },
  { value: 'integrations', label: 'Integrations', icon: Plug },
  { value: 'data', label: 'Data & System', icon: Database },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'ui', label: 'UI Preferences', icon: Palette },
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

function UsersTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="User Management" description="Add, edit, and manage system users and their roles.">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{mockUsers.length} users registered</p>
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add User</Button>
        </div>
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/30 text-left">
              <th className="px-3 py-2 font-medium">Name</th><th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th><th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody>
              {mockUsers.map(u => (
                <tr key={u.id} className="border-t border-border/30">
                  <td className="px-3 py-2.5">{u.name}</td><td className="px-3 py-2.5 text-muted-foreground">{u.email}</td>
                  <td className="px-3 py-2.5"><Badge variant="outline" className="text-xs">{u.role}</Badge></td>
                  <td className="px-3 py-2.5"><Badge variant={u.status === 'Active' ? 'default' : 'secondary'} className="text-xs">{u.status}</Badge></td>
                  <td className="px-3 py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="Role Permissions" description="Define what each role can access.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {roles.map(r => (
            <div key={r} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>
              </div>
              <div className="space-y-1">
                {['Dashboard', 'Devices', 'Ventilation', 'Settings'].map(p => (
                  <div key={p} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{p}</span>
                    <Switch defaultChecked={r !== 'Viewer' || p === 'Dashboard'} className="scale-75" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function MineConfigTab() {
  const zones = ['Zone A - Main Shaft', 'Zone B - Extraction', 'Zone C - Processing', 'Zone D - Ventilation Shaft', 'Zone E - Storage'];
  return (
    <div className="space-y-4">
      <SectionCard title="Mine Zones" description="Create and manage underground mine zones.">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{zones.length} zones configured</p>
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Zone</Button>
        </div>
        {zones.map((z, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{z}</p>
              <p className="text-xs text-muted-foreground">Depth: {150 + i * 50}m · {3 + i} devices assigned</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Zone Connections" description="Define airflow paths between zones.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['A → B (Main Tunnel)', 'B → C (Cross Cut 1)', 'C → D (Vent Raise)', 'D → E (Return Airway)'].map((c, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded border border-border/40 bg-muted/10">
              <span className="text-sm">{c}</span>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

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
          <div className="space-y-2">
            <Label>Data Protocol</Label>
            <Select defaultValue="mqtt"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="mqtt">MQTT</SelectItem><SelectItem value="http">HTTP REST</SelectItem><SelectItem value="coap">CoAP</SelectItem></SelectContent>
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

function DigitalTwinTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Simulation Parameters" description="Configure the Digital Twin simulation engine.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Simulation Step (ms)</Label><Input type="number" defaultValue="1000" /></div>
          <div className="space-y-2"><Label>Prediction Horizon (min)</Label><Input type="number" defaultValue="30" /></div>
          <div className="space-y-2"><Label>Gas Diffusion Rate</Label><Slider defaultValue={[50]} max={100} step={1} /><p className="text-xs text-muted-foreground">50%</p></div>
          <div className="space-y-2"><Label>Airflow Model</Label>
            <Select defaultValue="cfd"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cfd">CFD-Based</SelectItem><SelectItem value="empirical">Empirical</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Prediction Settings" description="Adjust AI prediction and gas propagation behavior.">
        <SettingRow label="Real-time Sync" description="Continuously sync sensor data to the twin model."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Predictive Alerts" description="Generate alerts from predicted future conditions."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Scenario Recording" description="Save what-if simulation scenarios for review."><Switch /></SettingRow>
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

function IntegrationsTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="IoT Gateway" description="Configure connections to IoT gateways.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Gateway IP Address</Label><Input defaultValue="192.168.1.100" /></div>
          <div className="space-y-2"><Label>Port</Label><Input defaultValue="1883" /></div>
          <div className="space-y-2"><Label>Protocol</Label>
            <Select defaultValue="mqtt"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="mqtt">MQTT</SelectItem><SelectItem value="amqp">AMQP</SelectItem><SelectItem value="http">HTTP</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Client ID</Label><Input defaultValue="smartmine-vod-01" /></div>
        </div>
      </SectionCard>
      <SectionCard title="SCADA Integration" description="Configure SCADA system API endpoints.">
        <div className="space-y-3">
          <div className="space-y-2"><Label>SCADA API Endpoint</Label><Input defaultValue="https://scada.mine.local/api/v2" /></div>
          <div className="space-y-2"><Label>API Key</Label><Input type="password" defaultValue="sk-xxxx-xxxx-xxxx" /></div>
          <SettingRow label="SCADA Sync Enabled" description="Enable real-time data sync with SCADA system."><Switch defaultChecked /></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="Communication Protocols" description="Enable/disable communication protocols.">
        {[{ name: 'LoRaWAN', desc: 'Long-range low-power WAN', icon: Radio, on: true }, { name: 'Wi-Fi', desc: 'Standard wireless', icon: Wifi, on: true }, { name: 'BLE', desc: 'Bluetooth Low Energy', icon: Smartphone, on: true }, { name: 'Zigbee', desc: 'Mesh networking', icon: Radio, on: false }].map((p, i) => (
          <SettingRow key={i} label={p.name} description={p.desc}><Switch defaultChecked={p.on} /></SettingRow>
        ))}
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

function SecurityTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Access Control" description="Configure authentication and authorization.">
        <SettingRow label="Role-Based Access Control" description="Restrict features based on user roles."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Multi-Factor Authentication" description="Require MFA for all admin accounts."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Session Timeout (minutes)" description="Auto-logout after inactivity.">
          <Input type="number" defaultValue="30" className="w-20 h-8" />
        </SettingRow>
      </SectionCard>
      <SectionCard title="Authentication Methods" description="Enable supported sign-in methods.">
        <SettingRow label="Email & Password" description="Standard email/password login."><Switch defaultChecked /></SettingRow>
        <SettingRow label="SSO (SAML)" description="Enterprise single sign-on."><Switch /></SettingRow>
        <SettingRow label="LDAP / Active Directory" description="Connect to corporate directory."><Switch /></SettingRow>
        <SettingRow label="Biometric" description="Fingerprint or face recognition on supported devices."><Switch /></SettingRow>
      </SectionCard>
      <SectionCard title="Login Activity" description="Recent authentication events.">
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/30 text-left">
              <th className="px-3 py-2 font-medium">User</th><th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">IP Address</th><th className="px-3 py-2 font-medium">Time</th>
            </tr></thead>
            <tbody>
              {[{ user: 'admin@smartmine.io', action: 'Login', ip: '10.0.1.45', time: '2 min ago' }, { user: 'john@smartmine.io', action: 'Login', ip: '10.0.1.78', time: '15 min ago' }, { user: 'sarah@smartmine.io', action: 'Logout', ip: '10.0.2.12', time: '1 hr ago' }].map((l, i) => (
                <tr key={i} className="border-t border-border/30">
                  <td className="px-3 py-2">{l.user}</td>
                  <td className="px-3 py-2"><Badge variant={l.action === 'Login' ? 'default' : 'secondary'} className="text-xs">{l.action}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground">{l.ip}</td>
                  <td className="px-3 py-2 text-muted-foreground">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function UIPreferencesTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Theme & Appearance" description="Customize the application look and feel.">
        <div className="space-y-2"><Label>Theme</Label>
          <Select defaultValue="dark"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="dark">Dark (Industrial)</SelectItem><SelectItem value="light">Light</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Accent Color</Label>
          <div className="flex gap-2">
            {['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500'].map((c, i) => (
              <button key={i} className={`h-8 w-8 rounded-full ${c} border-2 ${i === 0 ? 'border-foreground' : 'border-transparent'} hover:border-foreground transition-colors`} />
            ))}
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Dashboard Layout" description="Configure default dashboard view.">
        <div className="space-y-2"><Label>Default Landing Page</Label>
          <Select defaultValue="/"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="/">Dashboard</SelectItem><SelectItem value="/map">Mine Map</SelectItem><SelectItem value="/ventilation">Ventilation</SelectItem><SelectItem value="/digital-twin">Digital Twin</SelectItem></SelectContent>
          </Select>
        </div>
        <SettingRow label="Show Metric Cards" description="Display KPI cards on dashboard header."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Show Chart Animations" description="Enable animated chart transitions."><Switch defaultChecked /></SettingRow>
        <SettingRow label="Compact Mode" description="Reduce spacing for more data density."><Switch /></SettingRow>
      </SectionCard>
      <SectionCard title="Widget Visibility" description="Show or hide dashboard widgets.">
        {['Gas Monitoring', 'Temperature Map', 'Worker Locations', 'Fan Status', 'Energy Usage', 'Alert Feed'].map((w, i) => (
          <SettingRow key={i} label={w} description=""><Switch defaultChecked={i < 5} /></SettingRow>
        ))}
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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1.5 rounded-lg">
          {tabItems.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="mine"><MineConfigTab /></TabsContent>
        <TabsContent value="devices"><DevicesTab /></TabsContent>
        <TabsContent value="ventilation"><VentilationTab /></TabsContent>
        <TabsContent value="twin"><DigitalTwinTab /></TabsContent>
        <TabsContent value="fleet"><FleetWorkersTab /></TabsContent>
        <TabsContent value="alerts"><AlertsTab /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
        <TabsContent value="data"><DataSystemTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="ui"><UIPreferencesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
