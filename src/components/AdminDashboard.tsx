import React from "react"
import {
    Mail,
    UserPlus,
    HelpCircle,
    CheckCircle,
    Users,
    UserCheck,
    UserCog,
    Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
    <Card className="bg-white border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <Icon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-green-600">{value}</div>
        </CardContent>
    </Card>
)

interface ChartCardProps {
    title: string
    subtitle: string
    data: Array<{ label: string; value: number; color: string }>
    highlighted?: boolean
}

const ChartCard = ({ title, subtitle, data, highlighted = false }: ChartCardProps) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className={`bg-white border border-gray-200 ${highlighted ? 'ring-2 ring-purple-500' : ''}`}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                <p className="text-sm text-gray-600">{subtitle}</p>
            </CardHeader>
            <CardContent>
                <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100
                            const circumference = 2 * Math.PI * 16
                            const strokeDasharray = circumference
                            const strokeDashoffset = circumference - (percentage / 100) * circumference
                            const offset = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0)
                            const strokeDashoffsetTotal = circumference - (offset / 100) * circumference

                            return (
                                <circle
                                    key={item.label}
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth="3"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffsetTotal}
                                    strokeLinecap="round"
                                />
                            )
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{total}</div>
                            <div className="text-xs text-gray-500">Total</div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    {data.map((item, index) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-gray-700">{item.label}</span>
                            </div>
                            <span className="font-medium text-gray-900">
                                {((item.value / total) * 100).toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export const AdminDashboard = () => {
    const stats = [
        { title: "Total Request", value: "3", icon: Mail },
        { title: "Request This Month", value: "3", icon: UserPlus },
        { title: "Pending Request", value: "0", icon: HelpCircle },
        { title: "Completed Request", value: "3", icon: CheckCircle },
        { title: "Total User", value: "6", icon: Users },
        { title: "Approved User", value: "4", icon: UserCheck },
        { title: "Total Users With Family Registered", value: "5", icon: UserCog },
        { title: "Total Residents", value: "5", icon: Users },
        { title: "Total Service Hours", value: "119.38", icon: Clock }
    ]

    const familyRelationships = [
        { label: "Item 1", value: 5, color: "#166534" },
        { label: "Item 2", value: 2, color: "#16a34a" },
        { label: "Item 3", value: 1, color: "#22c55e" }
    ]

    const genderDistribution = [
        { label: "Item 1", value: 5, color: "#166534" },
        { label: "Item 2", value: 2, color: "#16a34a" },
        { label: "Item 3", value: 1, color: "#22c55e" }
    ]

    const ageDistribution = [
        { label: "Item 1", value: 5, color: "#166534" },
        { label: "Item 2", value: 2, color: "#16a34a" },
        { label: "Item 3", value: 1, color: "#22c55e" }
    ]

    return (
        <div className="space-y-6">
            {/* System Statistics */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                        />
                    ))}
                </div>
            </section>

            {/* Family Demographics */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Family Demographics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ChartCard
                        title="Family Relationships"
                        subtitle="Distribution by Relationship Type"
                        data={familyRelationships}
                    />
                    <ChartCard
                        title="Gender Distribution"
                        subtitle="Distribution by Gender"
                        data={genderDistribution}
                        highlighted={true}
                    />
                    <ChartCard
                        title="Age Distribution"
                        subtitle="Distribution by Age Brackets"
                        data={ageDistribution}
                    />
                </div>
            </section>
        </div>
    )
} 