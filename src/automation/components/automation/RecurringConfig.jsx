import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { ClipboardList, Clock } from "lucide-react";
import { useEffect } from "react";

export function RecurringConfigPanel({ config, onChange }) {
    // Default initial shape if nothing exists
    const mapOldFrequency = (freq) => {
        if (freq === 'every_day') return 'Every Day';
        if (freq === 'every_week') return 'Every Week';
        if (freq === 'every_month') return 'Every Month';
        return freq;
    };

    const mapOldScheduleType = (st) => {
        if (st === 'specific') return 1;
        if (st === 'pattern') return 2;
        return st;
    };

    const safeConfig = {
        frequency: mapOldFrequency(config?.frequency) || "Every Month",
        scheduleType: mapOldScheduleType(config?.scheduleType) || mapOldScheduleType(config?.monthScheduleType) || 2,
        specific_day_of_month: config?.specific_day_of_month || config?.monthSpecificDay || 31,
        specific_week: config?.specific_week || config?.monthPatternWeek || "First",
        specific_day: config?.specific_day || config?.monthPatternDay || "Monday",
        week_days: config?.week_days || config?.weeklyDays || "Mon",
        specific_time: config?.specific_time || config?.time || "10:00",
    };

    // Keep parent in sync if we start with undefined config fields or old fields
    useEffect(() => {
        if (!config || Object.keys(config).length === 0 || config.weeklyDays || config.monthScheduleType || config.time || String(config.frequency).includes('_') || typeof config.scheduleType === 'string') {
            onChange(safeConfig);
        }
    }, [config]);

    const handleChange = (updates) => {
        onChange({ ...safeConfig, ...updates });
    };

    const formatTime12h = (time24) => {
        if (!time24) return "00:00 AM";
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    const getPreviewText = () => {
        const timeStr = formatTime12h(safeConfig.specific_time);
        if (safeConfig.frequency === "Every Day") {
            return `Runs every day at ${timeStr}`;
        }
        if (safeConfig.frequency === "Every Week") {
            const weekDaysArr = typeof safeConfig.week_days === 'string' ? (safeConfig.week_days ? safeConfig.week_days.split(',') : []) : (Array.isArray(safeConfig.week_days) ? safeConfig.week_days : []);
            if (weekDaysArr.length === 0) return `Choose days to run at ${timeStr}`;
            
            // Map abbreviated days to full names
            const dayMap = {
                'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 
                'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
            };

            const fullDays = weekDaysArr.map(d => dayMap[d] || d);

            if (fullDays.length === 1) {
                 return `Runs every ${fullDays[0]} at ${timeStr}`;
            } else if (fullDays.length === 7) {
                 return `Runs every day at ${timeStr}`;
            } else if (fullDays.length === 5 && !fullDays.includes('Saturday') && !fullDays.includes('Sunday')) {
                 return `Runs every weekday at ${timeStr}`;
            }
           
            // Format list with commas and 'and'
            const lastDay = fullDays.pop();
            const daysStr = fullDays.length > 0 ? `${fullDays.join(', ')} and ${lastDay}` : lastDay;
            return `Runs every ${daysStr} at ${timeStr}`;
        }
        if (safeConfig.frequency === "Every Month") {
            if (Number(safeConfig.scheduleType) === 1) {
                let suffix = "th";
                const d = Number(safeConfig.specific_day_of_month);
                if (d % 10 === 1 && d !== 11) suffix = "st";
                else if (d % 10 === 2 && d !== 12) suffix = "nd";
                else if (d % 10 === 3 && d !== 13) suffix = "rd";
                return `Runs every ${d}${suffix} of the month at ${timeStr}`;
            } else {
                return `Runs every ${safeConfig.specific_week} ${safeConfig.specific_day} of the month at ${timeStr}`;
            }
        }
        return `Runs at ${timeStr}`;
    };

    const daysOfWeek = [
        { id: "Mon", label: "Mon" },
        { id: "Tue", label: "Tue" },
        { id: "Wed", label: "Wed" },
        { id: "Thu", label: "Thu" },
        { id: "Fri", label: "Fri" },
        { id: "Sat", label: "Sat" },
        { id: "Sun", label: "Sun" },
    ];

    const weekDaysArr = typeof safeConfig.week_days === 'string' ? (safeConfig.week_days ? safeConfig.week_days.split(',') : []) : (Array.isArray(safeConfig.week_days) ? safeConfig.week_days : []);

    return (
        <div className="space-y-6">
            <div className="bg-[#FAF9F6] border border-[#F0ECE1] rounded-xl p-5 shadow-sm">
                <div className="space-y-1.5 mb-5">
                    <Label className="text-[13px] text-gray-700 font-medium">Frequency</Label>
                    <Select value={String(safeConfig.frequency)} onValueChange={(val) => handleChange({ frequency: val })}>
                        <SelectTrigger className="w-full bg-white h-10 border-gray-200 focus:ring-primary focus:border-primary">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Every Day">Every Day</SelectItem>
                            <SelectItem value="Every Week">Every Week</SelectItem>
                            <SelectItem value="Every Month">Every Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {safeConfig.frequency === "Every Month" && (
                    <div className="space-y-3 mb-5">
                        <Label className="text-[13px] text-gray-700 font-medium">Schedule Type</Label>
                        
                        <div className="space-y-3">
                            <div 
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                    Number(safeConfig.scheduleType) === 1 
                                    ? "bg-white border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]" 
                                    : "bg-transparent border-transparent hover:bg-gray-50 text-gray-500"
                                }`}
                                onClick={() => handleChange({ scheduleType: 1 })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${Number(safeConfig.scheduleType) === 1 ? "border-green-500" : "border-gray-300"}`}>
                                        {Number(safeConfig.scheduleType) === 1 && <div className="h-[10px] w-[10px] rounded-full bg-green-500" />}
                                    </div>
                                    <span className={`text-[14px] font-medium ${Number(safeConfig.scheduleType) === 1 ? "text-gray-900" : "text-gray-500"}`}>On a specific date</span>
                                </div>
                                
                                {Number(safeConfig.scheduleType) === 1 && (
                                    <div className="flex items-center gap-2 pl-7 mt-3">
                                        <span className="text-[13px] text-gray-500">Day</span>
                                        <Input 
                                            type="number" 
                                            min={1} 
                                            max={31} 
                                            className="w-[70px] h-9 text-center bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary shadow-sm" 
                                            value={safeConfig.specific_day_of_month} 
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val)) val = "";
                                                handleChange({ specific_day_of_month: val });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-[13px] text-gray-500">of every month</span>
                                    </div>
                                )}
                            </div>

                            <div 
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                    Number(safeConfig.scheduleType) === 2 
                                    ? "bg-white border-gray-200 shadow-[0_2px_10px_-4_px_rgba(0,0,0,0.05)]" 
                                    : "bg-transparent border-transparent hover:bg-gray-50 text-gray-500"
                                }`}
                                onClick={() => handleChange({ scheduleType: 2 })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${Number(safeConfig.scheduleType) === 2 ? "border-green-500" : "border-gray-300"}`}>
                                        {Number(safeConfig.scheduleType) === 2 && <div className="h-[10px] w-[10px] rounded-full bg-green-500" />}
                                    </div>
                                    <span className={`text-[14px] font-medium ${Number(safeConfig.scheduleType) === 2 ? "text-gray-900" : "text-gray-500"}`}>On a pattern</span>
                                </div>

                                {Number(safeConfig.scheduleType) === 2 && (
                                    <div className="flex items-center gap-2 pl-7 mt-3 flex-wrap">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Select value={String(safeConfig.specific_week)} onValueChange={(val) => handleChange({ specific_week: val })}>
                                                <SelectTrigger className="w-[100px] h-9 bg-white border-gray-200 shadow-sm text-[13px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["First", "Second", "Third", "Fourth", "Last"].map(w => (
                                                        <SelectItem key={w} value={w} className="text-[13px]">{w}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Select value={String(safeConfig.specific_day)} onValueChange={(val) => handleChange({ specific_day: val })}>
                                                <SelectTrigger className="w-[120px] h-9 bg-white border-gray-200 shadow-sm text-[13px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                                                        <SelectItem key={d} value={d} className="text-[13px]">{d}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <span className="text-[13px] text-gray-500">of every month</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {safeConfig.frequency === "Every Week" && (
                    <div className="space-y-2 mb-5">
                        <Label className="text-[13px] text-gray-700 font-medium">Which days?</Label>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                            {daysOfWeek.map(day => {
                                const isSelected = weekDaysArr.includes(day.id);
                                return (
                                    <button
                                        key={day.id}
                                        type="button"
                                        className={`h-[38px] min-w-[38px] px-3 rounded-[12px] flex items-center justify-center text-[13px] font-medium transition-all ${
                                            isSelected 
                                            ? "bg-green-500 text-white shadow-sm border border-transparent" 
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                        onClick={() => {
                                            const newDays = isSelected
                                                ? weekDaysArr.filter(d => d !== day.id)
                                                : [...weekDaysArr, day.id];
                                            handleChange({ week_days: newDays.join(',') });
                                        }}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 px-4 py-3 bg-green-100 border border-green-200 rounded-lg">
                    <ClipboardList className="h-[15px] w-[15px] text-green-700" />
                    <span className="text-[13px] font-medium text-black">{getPreviewText()}</span>
                </div>
            </div>

            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                <Label className="text-[13px] text-gray-700 font-medium">Time</Label>
                <div className="relative w-full">
                    <Input 
                        type="time" 
                        className="pl-10 h-[42px] bg-white border-gray-200 outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-[14px]" 
                        value={safeConfig.specific_time} 
                        onChange={(e) => handleChange({ specific_time: e.target.value })}
                    />

                    <Clock className="w-[16px] h-[16px] absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary" />
                </div>
            </div>
        </div>
    );
}

