import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect } from "react";

export function AfterDateConfigPanel({ config, onChange, customFields = [] }) {
    // Default initial shape if nothing exists
    const safeConfig = {
        referenceField: "",
        daysAfter: "3",
        time: "09:00",
        ...config
    };

    // Keep parent in sync
    useEffect(() => {
        if (!config || Object.keys(config).length === 0) {
            onChange(safeConfig);
        }
    }, [config, onChange, safeConfig]);

    const handleChange = (updates) => {
        onChange({ ...safeConfig, ...updates });
    };

    // Dynamic field options
    const referenceFields = [
        ...customFields.map(f => ({
            value: f.id?.toString() || f._id?.toString(),
            label: f.name || f.lead_custom_field_name
        }))
    ];

    return (
        <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
                <div className="mb-4">
                    <h3 className="text-[15px] font-semibold text-gray-900">After Date</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">Trigger X days after a reference date field</p>
                </div>

                <div className="space-y-6 mt-6">
                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                        <Label className="text-[13px] text-gray-700 font-medium">Reference Field</Label>
                        <Select 
                            value={safeConfig.referenceField?.toString()} 
                            onValueChange={(v) => handleChange({ referenceField: v })}
                        >
                            <SelectTrigger className="w-full bg-[#FAFAFA] border-gray-200 h-10 text-[14px]">
                                <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceFields.map(f => (
                                    <SelectItem key={f.value} value={f.value} className="text-[13px]">
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label className="text-[13px] text-gray-700 font-medium">Days After</Label>
                            <Input 
                                type="number" 
                                min="0"
                                className="w-full h-10 bg-[#FAFAFA] border-gray-200 outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-[14px]" 
                                value={safeConfig.daysAfter} 
                                onChange={(e) => handleChange({ daysAfter: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label className="text-[13px] text-gray-700 font-medium">Time</Label>
                            <div className="relative w-full">
                                <Input 
                                    type="time" 
                                    className="w-full h-10 pr-10 bg-[#FAFAFA] border-gray-200 outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-[14px] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:right-0" 
                                    value={safeConfig.time} 
                                    onChange={(e) => handleChange({ time: e.target.value })}
                                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch(err){} }}
                                />
                                <Clock className="w-[16px] h-[16px] absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
