export function InformationCommunity() {
    return (
        <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
            <div className="flex items-center justify-center h-64">
                {/* AstroCat SVG */}
                <div className="opacity-30">
                    <img
                        src="/ico-astrocat.svg"
                        alt="AstroCat"
                        className="w-48 h-48 object-contain filter blur-sm"
                    />
                </div>
            </div>
        </div>
    )
}
