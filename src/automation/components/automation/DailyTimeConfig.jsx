import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Clock } from "lucide-react";
import { useEffect } from "react";

export function DailyTimeConfigPanel({ config, onChange }) {
    // Default initial shape if nothing exists
    const safeConfig = {
        time: "09:00",
        ...config
    };

    // Keep parent in sync if we start with undefined config fields
    useEffect(() => {
        if (!config || Object.keys(config).length === 0) {
            onChange(safeConfig);
        }
    }, [config, onChange, safeConfig]);

    const handleChange = (updates) => {
        onChange({ ...safeConfig, ...updates });
    };

    return (
        <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
                <div className="mb-4">
                    <h3 className="text-[15px] font-semibold text-gray-900">Daily Execution</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">Run this automation every day at a specific time</p>
                </div>

                <div className="space-y-1.5 focus-within:text-primary transition-colors mt-6">
                    <Label className="text-[13px] text-gray-700 font-medium">Time of Day</Label>
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
    );
}
