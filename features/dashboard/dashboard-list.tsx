import { Briefcase, FileText, HeartHandshake, Package, Users } from "lucide-react";
import { useDivisionContext } from "../divisions/contexts/DivisionContext";
import { useUserContext } from "../users/contexts/UserContext";
import { useActivityContext } from "../activities/contexts/ActivityContext";
import { useDonationContext } from "../donation/contexts/DonationContext";
import { useAssetContext } from "../inventory/contexts/AssetContext";
export const UserStats = () => {
    const { stats: statsData } = useUserContext();
    return (
        <div className="bg-linear-to-br from-[#9F7AEA] to-[#7C3AED] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold">{statsData?.total_users}</h3>
                <p className="text-sm text-white/80 font-medium mt-1">
                    Total Users
                </p>
            </div>
        </div>
    );
};

export const ActivityStats = () => {
    const { pagination } = useActivityContext();
    return (
        <div className="bg-linear-to-br from-[#9F7AEA] to-[#7C3AED] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold">{pagination?.total}</h3>
                <p className="text-sm text-white/80 font-medium mt-1">
                    Total Activities
                </p>
            </div>
        </div>
    );
};

export const DivisionStats = () => {
    const { divisionStats } = useDivisionContext();

    return (
        <div className="bg-linear-to-br from-[#60A5FA] to-[#3B82F6] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Briefcase className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold">{divisionStats?.total_divisions}</h3>
                <p className="text-sm text-white/80 font-medium mt-1">
                    Total Divisions
                </p>
            </div>
        </div>
    );
};

export const DonationStats = () => {
    const { stats } = useDonationContext();
    return (
        <div className="bg-linear-to-br from-[#FB923C] to-[#F97316] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <HeartHandshake className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold">{stats?.data.total_donations}</h3>
                <p className="text-sm text-white/80 font-medium mt-1">
                    Total Donations
                </p>
            </div>
        </div>
    );
};

export const InventoryStats = () => {
    const { stats: statsData } = useAssetContext();
    return (
        <div className="bg-linear-to-br from-[#F87171] to-[#EF4444] rounded-2xl p-6 text-white shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Package className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-3xl font-bold">{statsData?.total_assets}</h3>
                <p className="text-sm text-white/80 font-medium mt-1">
                    Total Assets
                </p>
            </div>
        </div>
    );
};